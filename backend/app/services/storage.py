"""
MinIO/S3 Object Storage service.
Handles pre-signed URL generation for direct browser-to-storage uploads
(Zero Memory Choke architecture from blueprint Section 4.2.1).
"""
import uuid
from datetime import timedelta
from minio import Minio
from app.config import get_settings

settings = get_settings()

# MinIO client (S3-compatible)
minio_client = Minio(
    endpoint=settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SSL,
)

# External client for generating URLs accessible from browser
minio_external_client = Minio(
    endpoint=settings.MINIO_EXTERNAL_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SSL,
)

BUCKET = settings.MINIO_BUCKET


def ensure_bucket():
    """Create the bucket if it doesn't exist."""
    if not minio_client.bucket_exists(BUCKET):
        minio_client.make_bucket(BUCKET)


def generate_presigned_upload_url(filename: str, content_type: str = "image/jpeg") -> tuple[str, str]:
    """
    Generate a pre-signed PUT URL for direct browser upload.
    Returns (upload_url, object_key).
    
    This implements the 'Direct-to-Storage Upload via Pre-signed URLs'
    pattern from blueprint Section 4.2.1 — the FastAPI server handles
    0 bytes of image binary in its RAM.
    """
    # Generate unique key: uploads/<uuid>/<original_filename>
    unique_id = str(uuid.uuid4())
    object_key = f"uploads/{unique_id}/{filename}"

    # Generate pre-signed PUT URL (valid for 1 hour)
    upload_url = minio_external_client.presigned_put_object(
        bucket_name=BUCKET,
        object_name=object_key,
        expires=timedelta(hours=1),
    )

    return upload_url, object_key


def generate_presigned_download_url(object_key: str, expires_hours: int = 24) -> str:
    """Generate a pre-signed GET URL for downloading/viewing results."""
    if not object_key:
        return None

    return minio_external_client.presigned_get_object(
        bucket_name=BUCKET,
        object_name=object_key,
        expires=timedelta(hours=expires_hours),
    )


def get_object_bytes(object_key: str) -> bytes:
    """Download object bytes from MinIO (used by workers)."""
    response = minio_client.get_object(BUCKET, object_key)
    data = response.read()
    response.close()
    response.release_conn()
    return data


def put_object_bytes(object_key: str, data: bytes, content_type: str = "image/png"):
    """Upload bytes to MinIO (used by workers to store masks/overlays)."""
    import io
    minio_client.put_object(
        bucket_name=BUCKET,
        object_name=object_key,
        data=io.BytesIO(data),
        length=len(data),
        content_type=content_type,
    )
