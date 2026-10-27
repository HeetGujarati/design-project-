"""
Upload Routes — POST /api/upload/ticket
Generates pre-signed URLs for direct browser-to-MinIO uploads.
Implements blueprint Section 4.2.1: 'Zero Memory Choke' architecture.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import UploadTicketRequest, UploadTicketResponse
from app.services.storage import generate_presigned_upload_url, ensure_bucket

router = APIRouter()


@router.post("/upload/ticket", response_model=UploadTicketResponse)
async def create_upload_ticket(request: UploadTicketRequest):
    """
    Generate a pre-signed URL for direct image upload to MinIO.
    
    The client uploads the image binary DIRECTLY to object storage,
    bypassing the API server's memory entirely. This enables handling
    thousands of concurrent uploads without RAM exhaustion.
    """
    try:
        # Ensure the bucket exists
        ensure_bucket()

        # Generate pre-signed PUT URL
        upload_url, image_key = generate_presigned_upload_url(
            filename=request.filename,
            content_type=request.content_type,
        )

        return UploadTicketResponse(
            upload_url=upload_url,
            image_key=image_key,
            expires_in=3600,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate upload ticket: {str(e)}"
        )
