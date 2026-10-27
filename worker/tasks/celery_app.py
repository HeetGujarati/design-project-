"""
Celery Application Configuration for the AI Worker Fleet.
Implements blueprint Section 4 — Tier 4: Distributed AI Inference Fleet.
"""
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

celery_app = Celery(
    "damage_segmentation",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2"),
    include=["tasks.segment_task"],
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Task behavior
    task_track_started=True,
    task_acks_late=True,          # Re-queue on worker crash (Failure Recovery)
    worker_prefetch_multiplier=1,  # Prevent greedy prefetching

    # Result expiry
    result_expires=3600,  # Results expire after 1 hour

    # Retry
    task_default_retry_delay=30,
    task_max_retries=3,
)
