"""
Configuration management using Pydantic Settings.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://admin:securepass123@postgres:5432/damage_seg"
    DATABASE_URL_SYNC: str = "postgresql://admin:securepass123@postgres:5432/damage_seg"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    # MinIO (S3-compatible)
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "damage-inspections"
    MINIO_USE_SSL: bool = False
    MINIO_EXTERNAL_ENDPOINT: str = "localhost:9000"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000"

    # AI Model
    MODEL_PATH: str = "/app/models/yolov8_damage_seg.pt"
    DEVICE: str = "0"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — loaded once, reused everywhere."""
    return Settings()
