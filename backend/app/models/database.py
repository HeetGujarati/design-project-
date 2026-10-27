"""
Database models and connection setup.
SQLAlchemy async engine for PostgreSQL with the Inspection table
storing all 6 required outputs from the blueprint.
"""
import uuid
import enum
import datetime
from sqlalchemy import (
    Column, String, Float, Integer, DateTime,
    Enum, Text, create_engine
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings

settings = get_settings()

# Async engine for FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Sync engine for Alembic migrations
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=False,
    pool_size=10,
    max_overflow=5,
)

SyncSessionLocal = sessionmaker(bind=sync_engine)

Base = declarative_base()


class SeverityLevel(str, enum.Enum):
    """Damage severity classification based on damage percentage.
    - LOW: 0% - 15% damage → Routine monitoring
    - MODERATE: 15% - 30% → Scheduled maintenance
    - CRITICAL: 30% - 100% → Urgent intervention
    """
    LOW = "low"
    MODERATE = "moderate"
    CRITICAL = "critical"


class InspectionStatus(str, enum.Enum):
    """Processing pipeline status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Inspection(Base):
    """
    Core inspection record storing all 6 required workflow outputs:
    1. Original Image → original_image_key (S3 path)
    2. Damage Mask → mask_image_key (S3 path)
    3. Overlay Image → overlay_image_key (S3 path)
    4. Bounding Box → bbox_data (JSON)
    5. Damaged Area → damaged_pixels (int)
    6. Damage Percentage → damage_percentage (float)
    """
    __tablename__ = "inspections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(255), unique=True, index=True, nullable=False)
    status = Column(
        Enum(InspectionStatus),
        default=InspectionStatus.PENDING,
        nullable=False,
    )

    # Input
    original_image_key = Column(String(500), nullable=False)
    original_filename = Column(String(255))
    structure_type = Column(String(100), default="concrete")

    # Output 2: Damage Mask
    mask_image_key = Column(String(500), nullable=True)

    # Output 3: Overlay Image
    overlay_image_key = Column(String(500), nullable=True)

    # Output 4: Bounding Boxes
    bbox_data = Column(Text, nullable=True)  # JSON: [{"x","y","w","h","confidence"}]

    # Output 5: Damaged Area
    damaged_pixels = Column(Integer, nullable=True)
    total_pixels = Column(Integer, nullable=True)

    # Output 6: Damage Percentage & Severity
    damage_percentage = Column(Float, nullable=True)
    severity = Column(Enum(SeverityLevel), nullable=True)

    # Model metadata
    model_used = Column(String(100), default="yolov8-seg")
    inference_time_ms = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Inspection {self.task_id} | {self.status} | {self.damage_percentage}%>"


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables on startup."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
