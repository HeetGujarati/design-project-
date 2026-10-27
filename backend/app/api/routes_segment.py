"""
Segmentation Routes — POST /api/segment/enqueue
Enqueues segmentation jobs to the Celery worker pool.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import Inspection, InspectionStatus, get_db
from app.models.schemas import SegmentEnqueueRequest, SegmentEnqueueResponse
from app.services.queue import enqueue_segmentation

router = APIRouter()


@router.post("/segment/enqueue", response_model=SegmentEnqueueResponse)
async def enqueue_segmentation_job(
    request: SegmentEnqueueRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Enqueue a structural image for AI segmentation processing.
    
    1. Creates an inspection record in PostgreSQL (status: pending)
    2. Pushes the job to Redis/Celery task queue
    3. Returns task_id for WebSocket progress tracking
    
    The actual inference runs on distributed Celery workers 
    (blueprint Section 4: Tier 4 — Distributed AI Inference Fleet).
    """
    try:
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        inspection_id = uuid.uuid4()

        # Create inspection record in database
        inspection = Inspection(
            id=inspection_id,
            task_id=task_id,
            status=InspectionStatus.PENDING,
            original_image_key=request.image_key,
            original_filename=request.original_filename,
            structure_type=request.structure_type,
        )
        db.add(inspection)
        await db.flush()

        # Enqueue to Celery worker pool
        enqueue_segmentation(
            task_id=task_id,
            image_key=request.image_key,
            structure_type=request.structure_type,
        )

        return SegmentEnqueueResponse(
            task_id=task_id,
            inspection_id=str(inspection_id),
            status=InspectionStatus.PENDING,
            message="Segmentation job enqueued successfully. Connect to WebSocket for live progress.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to enqueue segmentation job: {str(e)}"
        )
