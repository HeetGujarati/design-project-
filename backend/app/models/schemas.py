"""
Pydantic v2 schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


# ──────────────────────────────────────────
# Enums
# ──────────────────────────────────────────

class SeverityLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    CRITICAL = "critical"


class InspectionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ──────────────────────────────────────────
# Upload Schemas
# ──────────────────────────────────────────

class UploadTicketRequest(BaseModel):
    """Request for a pre-signed upload URL."""
    filename: str = Field(..., description="Original image filename", examples=["bridge_crack_001.jpg"])
    content_type: str = Field(default="image/jpeg", description="MIME type of the image")
    structure_type: str = Field(default="concrete", description="Type of structure: bridge, wall, tunnel, road, dam")


class UploadTicketResponse(BaseModel):
    """Response containing pre-signed URL for direct MinIO upload."""
    upload_url: str = Field(..., description="Pre-signed PUT URL for direct binary upload to MinIO")
    image_key: str = Field(..., description="S3 object key where the image will be stored")
    expires_in: int = Field(default=3600, description="URL expiry time in seconds")


# ──────────────────────────────────────────
# Segmentation Schemas
# ──────────────────────────────────────────

class SegmentEnqueueRequest(BaseModel):
    """Request to enqueue a segmentation job."""
    image_key: str = Field(..., description="S3 key of the uploaded image")
    structure_type: str = Field(default="concrete", description="Structure type for context")
    original_filename: str = Field(default="", description="Original filename for display")


class SegmentEnqueueResponse(BaseModel):
    """Response after job is enqueued."""
    task_id: str = Field(..., description="Unique Celery task ID for tracking")
    inspection_id: str = Field(..., description="Database inspection record UUID")
    status: InspectionStatus = InspectionStatus.PENDING
    message: str = "Segmentation job enqueued successfully"


# ──────────────────────────────────────────
# Bounding Box Schema
# ──────────────────────────────────────────

class BoundingBox(BaseModel):
    """Single bounding box around a detected defect cluster."""
    x: int
    y: int
    w: int
    h: int
    confidence: float = Field(..., ge=0, le=1)


# ──────────────────────────────────────────
# Inspection Result Schemas
# ──────────────────────────────────────────

class InspectionDetail(BaseModel):
    """Full inspection result with all 6 outputs."""
    id: str
    task_id: str
    status: InspectionStatus

    # Input
    original_image_url: Optional[str] = None
    original_filename: Optional[str] = None
    structure_type: str = "concrete"

    # 6 Outputs
    mask_image_url: Optional[str] = None
    overlay_image_url: Optional[str] = None
    bounding_boxes: Optional[List[BoundingBox]] = None
    damaged_pixels: Optional[int] = None
    total_pixels: Optional[int] = None
    damage_percentage: Optional[float] = None
    severity: Optional[SeverityLevel] = None

    # Model info
    model_used: str = "yolov8-seg"
    inference_time_ms: Optional[float] = None

    # Timestamps
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InspectionListItem(BaseModel):
    """Summary item for inspection history table."""
    id: str
    task_id: str
    status: InspectionStatus
    original_filename: Optional[str] = None
    structure_type: str = "concrete"
    damage_percentage: Optional[float] = None
    severity: Optional[SeverityLevel] = None
    model_used: str = "yolov8-seg"
    inference_time_ms: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InspectionListResponse(BaseModel):
    """Paginated inspection list."""
    inspections: List[InspectionListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


# ──────────────────────────────────────────
# Benchmark Schemas
# ──────────────────────────────────────────

class ModelBenchmark(BaseModel):
    """Performance metrics for a single AI model."""
    model: str
    mIoU: float
    precision: float
    recall: float
    f1_score: float
    inference_ms: float


class BenchmarkResponse(BaseModel):
    """Comparative benchmark data for dashboard Graph 3."""
    benchmarks: List[ModelBenchmark]


# ──────────────────────────────────────────
# WebSocket Schemas
# ──────────────────────────────────────────

class WSProgressMessage(BaseModel):
    """Real-time progress update via WebSocket."""
    task_id: str
    status: InspectionStatus
    progress: int = Field(..., ge=0, le=100)
    message: Optional[str] = None
    damage_percentage: Optional[float] = None
    severity: Optional[SeverityLevel] = None
