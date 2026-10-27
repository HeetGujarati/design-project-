"""
Celery task queue integration for the FastAPI backend.
Enqueues segmentation jobs to be processed by distributed workers.
"""
from celery import Celery
from app.config import get_settings

settings = get_settings()

# Create Celery app proxy for task dispatch (not running workers here)
celery_app = Celery(
    "damage_segmentation",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,  # Re-queue on worker crash (blueprint: Failure Recovery)
    worker_prefetch_multiplier=1,
)


def enqueue_segmentation(task_id: str, image_key: str, structure_type: str) -> str:
    """
    Enqueue a segmentation job to the Celery worker pool.
    Returns the Celery async result ID.
    """
    result = celery_app.send_task(
        "tasks.segment_task.run_segmentation",
        kwargs={
            "task_id": task_id,
            "image_key": image_key,
            "structure_type": structure_type,
        },
        task_id=task_id,
    )
    return result.id
