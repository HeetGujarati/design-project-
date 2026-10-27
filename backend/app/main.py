"""
Scalable Damage Segmentation Platform — FastAPI Application Entry Point

Enterprise-grade REST API for structural damage detection and segmentation.
Implements blueprint Section 4 — Tier 2: Stateless API & Orchestration Layer.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.models.database import init_db
from app.services.storage import ensure_bucket
from app.api import routes_upload, routes_segment, routes_inspect, routes_benchmark, routes_ws

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.
    - Creates database tables on startup
    - Ensures MinIO bucket exists
    """
    # Startup
    print("🚀 Starting Scalable Damage Segmentation Platform API...")
    await init_db()
    print("✅ Database tables created/verified")

    try:
        ensure_bucket()
        print("✅ MinIO bucket ready")
    except Exception as e:
        print(f"⚠️ MinIO bucket setup deferred: {e}")

    print("✅ API ready to accept requests")
    yield

    # Shutdown
    print("🛑 Shutting down API...")


app = FastAPI(
    title="Scalable Damage Segmentation Platform",
    description=(
        "Enterprise computer-vision system for pixel-level structural damage detection. "
        "Processes structural images through YOLOv8-seg AI models and produces damage masks, "
        "overlay visualizations, bounding boxes, and quantitative damage metrics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Register Route Modules
# ──────────────────────────────────────────

# POST /api/upload/ticket — Pre-signed URL generation
app.include_router(routes_upload.router, prefix="/api", tags=["📤 Upload"])

# POST /api/segment/enqueue — Job queue submission
app.include_router(routes_segment.router, prefix="/api", tags=["🧠 Segmentation"])

# GET /api/inspections — History & detail
app.include_router(routes_inspect.router, prefix="/api", tags=["📋 Inspections"])

# GET /api/benchmarks — Model comparison metrics
app.include_router(routes_benchmark.router, prefix="/api", tags=["📊 Benchmarks"])

# WS /ws/inspection/{task_id} — Real-time progress
app.include_router(routes_ws.router, tags=["🔌 WebSocket"])


# ──────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "Scalable Damage Segmentation Platform API",
        "version": "1.0.0",
    }


@app.get("/", tags=["System"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Scalable Damage Segmentation Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "upload_ticket": "POST /api/upload/ticket",
            "segment_enqueue": "POST /api/segment/enqueue",
            "inspections": "GET /api/inspections",
            "benchmarks": "GET /api/benchmarks",
            "websocket": "WS /ws/inspection/{task_id}",
        },
    }
