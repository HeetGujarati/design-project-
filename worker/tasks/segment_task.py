"""
Celery Segmentation Task — The Core Worker Logic.

This is the main distributed task that runs on Celery workers.
Flow:
  1. Download image from MinIO
  2. Run YOLOv8-seg inference → 6 outputs
  3. Upload mask & overlay back to MinIO
  4. Save results to PostgreSQL
  5. Publish progress events to Redis Pub/Sub → WebSocket
  
Implements blueprint Section 4: Tier 4 — Distributed AI Inference Fleet.
Multiple workers can process independent image requests simultaneously.
"""
import os
import io
import json
import time
import datetime
import cv2
import redis
from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from tasks.celery_app import celery_app
from ai_engine.yolov8_seg import DamageSegmentationEngine
from dotenv import load_dotenv

load_dotenv()

# ──────────────────────────────────────────
# Service Connections
# ──────────────────────────────────────────

# Redis for progress publishing
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379/0"),
    decode_responses=True,
)

# MinIO for image storage
minio_client = Minio(
    endpoint=os.getenv("MINIO_ENDPOINT", "minio:9000"),
    access_key=os.getenv("MINIO_ACCESS_KEY", "minioadmin"),
    secret_key=os.getenv("MINIO_SECRET_KEY", "minioadmin123"),
    secure=os.getenv("MINIO_USE_SSL", "false").lower() == "true",
)

BUCKET = os.getenv("MINIO_BUCKET", "damage-inspections")

# PostgreSQL for results storage
db_engine = create_engine(
    os.getenv("DATABASE_URL_SYNC", "postgresql://admin:securepass123@postgres:5432/damage_seg"),
    pool_size=5,
    max_overflow=3,
)
SessionLocal = sessionmaker(bind=db_engine)

# AI Engine (loaded once per worker process, reused across tasks)
engine = None


def get_engine():
    """Lazy-load the AI engine (model loaded once, reused)."""
    global engine
    if engine is None:
        model_path = os.getenv("MODEL_PATH", "yolov8m-seg.pt")
        engine = DamageSegmentationEngine(model_path)
    return engine


def publish_progress(task_id: str, status: str, progress: int, **extra):
    """Publish progress event to Redis Pub/Sub for WebSocket streaming."""
    data = {"status": status, "progress": progress, **extra}
    redis_client.publish(f"task:{task_id}", json.dumps(data, default=str))


# ──────────────────────────────────────────
# Main Segmentation Task
# ──────────────────────────────────────────

@celery_app.task(bind=True, max_retries=3, default_retry_delay=30)
def run_segmentation(self, task_id: str, image_key: str, structure_type: str = "concrete"):
    """
    Main distributed segmentation task.
    
    Runs on Celery workers (blueprint: 'Multiple segmentation workers
    can process independent image requests simultaneously').
    
    Args:
        task_id: Unique job identifier for tracking
        image_key: MinIO object key for the uploaded image
        structure_type: Type of structure (bridge, wall, etc.)
    """
    try:
        print(f"🔧 Worker processing task: {task_id}")

        # ── Step 1: Update status to processing ──
        publish_progress(task_id, "processing", 5, message="Job picked up by worker")
        _update_db_status(task_id, "processing")

        # ── Step 2: Download image from MinIO ──
        publish_progress(task_id, "processing", 10, message="Downloading image from storage...")
        response = minio_client.get_object(BUCKET, image_key)
        image_bytes = response.read()
        response.close()
        response.release_conn()
        publish_progress(task_id, "processing", 25, message="Image downloaded. Starting AI inference...")

        # ── Step 3: Run AI Inference (produces all 6 outputs) ──
        publish_progress(task_id, "processing", 30, message="Running YOLOv8-seg inference...")
        seg_engine = get_engine()
        result = seg_engine.process(image_bytes)
        publish_progress(
            task_id, "processing", 70,
            message=f"Inference complete ({result.inference_time_ms}ms). Post-processing..."
        )

        # ── Step 4: Upload mask & overlay to MinIO ──
        publish_progress(task_id, "processing", 75, message="Uploading damage mask and overlay...")

        # Encode mask as PNG
        mask_key = f"results/{task_id}/mask.png"
        _, mask_bytes = cv2.imencode(".png", result.damage_mask)
        minio_client.put_object(
            BUCKET, mask_key,
            io.BytesIO(mask_bytes.tobytes()),
            length=len(mask_bytes),
            content_type="image/png",
        )

        # Encode overlay as PNG
        overlay_key = f"results/{task_id}/overlay.png"
        _, overlay_bytes = cv2.imencode(".png", result.overlay_image)
        minio_client.put_object(
            BUCKET, overlay_key,
            io.BytesIO(overlay_bytes.tobytes()),
            length=len(overlay_bytes),
            content_type="image/png",
        )

        publish_progress(task_id, "processing", 85, message="Saving results to database...")

        # ── Step 5: Save results to PostgreSQL ──
        bbox_json = json.dumps([
            {"x": bb.x, "y": bb.y, "w": bb.w, "h": bb.h, "confidence": bb.confidence}
            for bb in result.bounding_boxes
        ])

        _update_db_results(
            task_id=task_id,
            mask_key=mask_key,
            overlay_key=overlay_key,
            bbox_json=bbox_json,
            damaged_pixels=result.damaged_pixels,
            total_pixels=result.total_pixels,
            damage_percentage=result.damage_percentage,
            severity=result.severity.lower(),
            inference_time_ms=result.inference_time_ms,
        )

        # ── Step 6: Publish completion event ──
        publish_progress(
            task_id, "completed", 100,
            message="Segmentation complete!",
            damage_percentage=result.damage_percentage,
            severity=result.severity,
            damaged_pixels=result.damaged_pixels,
            total_pixels=result.total_pixels,
            inference_time_ms=result.inference_time_ms,
            bbox_count=len(result.bounding_boxes),
        )

        print(f"✅ Task {task_id} completed: {result.damage_percentage}% damage ({result.severity})")
        return {
            "task_id": task_id,
            "status": "completed",
            "damage_percentage": result.damage_percentage,
            "severity": result.severity,
        }

    except Exception as exc:
        print(f"❌ Task {task_id} failed: {exc}")
        publish_progress(
            task_id, "failed", 0,
            message=f"Processing failed: {str(exc)}",
            error=str(exc),
        )
        _update_db_status(task_id, "failed")

        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=30 * (self.request.retries + 1))


# ──────────────────────────────────────────
# Database Helpers
# ──────────────────────────────────────────

def _update_db_status(task_id: str, status: str):
    """Update inspection status in PostgreSQL."""
    session = SessionLocal()
    try:
        session.execute(
            text("UPDATE inspections SET status = :status WHERE task_id = :task_id"),
            {"status": status, "task_id": task_id},
        )
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"⚠️ DB status update failed: {e}")
    finally:
        session.close()


def _update_db_results(
    task_id: str,
    mask_key: str,
    overlay_key: str,
    bbox_json: str,
    damaged_pixels: int,
    total_pixels: int,
    damage_percentage: float,
    severity: str,
    inference_time_ms: float,
):
    """Update inspection with all segmentation results."""
    session = SessionLocal()
    try:
        session.execute(
            text("""
                UPDATE inspections SET
                    status = 'completed',
                    mask_image_key = :mask_key,
                    overlay_image_key = :overlay_key,
                    bbox_data = :bbox_json,
                    damaged_pixels = :damaged_pixels,
                    total_pixels = :total_pixels,
                    damage_percentage = :damage_percentage,
                    severity = :severity,
                    inference_time_ms = :inference_time_ms,
                    completed_at = :completed_at
                WHERE task_id = :task_id
            """),
            {
                "task_id": task_id,
                "mask_key": mask_key,
                "overlay_key": overlay_key,
                "bbox_json": bbox_json,
                "damaged_pixels": damaged_pixels,
                "total_pixels": total_pixels,
                "damage_percentage": damage_percentage,
                "severity": severity,
                "inference_time_ms": inference_time_ms,
                "completed_at": datetime.datetime.utcnow(),
            },
        )
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"⚠️ DB results update failed: {e}")
    finally:
        session.close()
