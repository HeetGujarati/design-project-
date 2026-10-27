"""
Inspection Routes — GET /api/inspections & GET /api/inspections/{id}
Paginated history with Redis caching (60s TTL per blueprint Section 4.2.4).
"""
import json
import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.database import Inspection, get_db
from app.models.schemas import (
    InspectionDetail, InspectionListItem,
    InspectionListResponse, BoundingBox,
)
from app.services.storage import generate_presigned_download_url
from app.services.cache import cache_get, cache_set

router = APIRouter()


@router.get("/inspections", response_model=InspectionListResponse)
async def list_inspections(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    status: str = Query(None, description="Filter by status"),
    severity: str = Query(None, description="Filter by severity"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get paginated inspection history for the dashboard table.
    Results are cached in Redis with 60s TTL for performance.
    """
    # Check Redis cache first
    cache_key = f"inspections:page={page}:per_page={per_page}:status={status}:severity={severity}"
    cached = await cache_get(cache_key)
    if cached:
        return InspectionListResponse(**cached)

    # Build query
    query = select(Inspection).order_by(desc(Inspection.created_at))

    if status:
        query = query.where(Inspection.status == status)
    if severity:
        query = query.where(Inspection.severity == severity)

    # Count total
    count_query = select(func.count()).select_from(Inspection)
    if status:
        count_query = count_query.where(Inspection.status == status)
    if severity:
        count_query = count_query.where(Inspection.severity == severity)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    result = await db.execute(query)
    inspections = result.scalars().all()

    # Build response
    items = [
        InspectionListItem(
            id=str(insp.id),
            task_id=insp.task_id,
            status=insp.status,
            original_filename=insp.original_filename,
            structure_type=insp.structure_type,
            damage_percentage=insp.damage_percentage,
            severity=insp.severity,
            model_used=insp.model_used,
            inference_time_ms=insp.inference_time_ms,
            created_at=insp.created_at,
        )
        for insp in inspections
    ]

    response = InspectionListResponse(
        inspections=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total > 0 else 1,
    )

    # Cache for 60 seconds (per blueprint)
    await cache_set(cache_key, response.model_dump(), ttl=60)
    return response


@router.get("/inspections/{inspection_id}", response_model=InspectionDetail)
async def get_inspection(
    inspection_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get full inspection detail with all 6 outputs and pre-signed image URLs.
    """
    # Check cache
    cache_key = f"inspection:{inspection_id}"
    cached = await cache_get(cache_key)
    if cached:
        return InspectionDetail(**cached)

    # Query database
    query = select(Inspection).where(
        (Inspection.id == inspection_id) | (Inspection.task_id == inspection_id)
    )
    result = await db.execute(query)
    inspection = result.scalar_one_or_none()

    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    # Generate pre-signed download URLs for images
    original_url = generate_presigned_download_url(inspection.original_image_key)
    mask_url = generate_presigned_download_url(inspection.mask_image_key)
    overlay_url = generate_presigned_download_url(inspection.overlay_image_key)

    # Parse bounding boxes
    bboxes = None
    if inspection.bbox_data:
        bboxes = [BoundingBox(**bb) for bb in json.loads(inspection.bbox_data)]

    detail = InspectionDetail(
        id=str(inspection.id),
        task_id=inspection.task_id,
        status=inspection.status,
        original_image_url=original_url,
        original_filename=inspection.original_filename,
        structure_type=inspection.structure_type,
        mask_image_url=mask_url,
        overlay_image_url=overlay_url,
        bounding_boxes=bboxes,
        damaged_pixels=inspection.damaged_pixels,
        total_pixels=inspection.total_pixels,
        damage_percentage=inspection.damage_percentage,
        severity=inspection.severity,
        model_used=inspection.model_used,
        inference_time_ms=inspection.inference_time_ms,
        created_at=inspection.created_at,
        completed_at=inspection.completed_at,
    )

    # Cache completed inspections for longer
    ttl = 300 if inspection.status == "completed" else 10
    await cache_set(cache_key, detail.model_dump(), ttl=ttl)
    return detail
