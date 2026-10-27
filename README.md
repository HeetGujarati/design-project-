# 🏗️ AegisDamage AI — Scalable Structural Damage Segmentation Platform

[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Full%20Stack-blue?logo=docker)](file:///d:/design%20project/docker-compose.yml)
[![YOLOv8-seg](https://img.shields.io/badge/YOLOv8--seg-CUDA%20Accelerated-green?logo=ultralytics)](file:///d:/design%20project/worker/ai_engine/yolov8_seg.py)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20%2B%20WebSockets-teal?logo=fastapi)](file:///d:/design%20project/backend/app/main.py)
[![Celery](https://img.shields.io/badge/Celery-Distributed%20Workers-brightgreen?logo=celery)](file:///d:/design%20project/worker/tasks/segment_task.py)
[![Next.js](https://img.shields.io/badge/Next.js%2016-Interactive%20Dashboard-black?logo=next.js)](file:///d:/design%20project/frontend)

An enterprise-grade, distributed computer-vision platform for pixel-level structural damage detection, crack segmentation, defect quantification, and civil engineering health monitoring.

Built strictly according to [PROJECT_BLUEPRINT.md](file:///d:/design%20project/PROJECT_BLUEPRINT.md).

---

## 🌟 Key Capabilities

### 1. The 6 Required Workflow Outputs
Every structural scan processed by the platform generates:
1. **Original Image**: Raw structural image preserved with SHA-256 hash.
2. **Damage Mask**: Pixel-level binary segmentation mask (white damage on black substrate).
3. **Overlay Image**: Semi-transparent translucent color overlay (crimson defect glow) superimposed on the structure.
4. **Bounding Box Clusters**: Defect boundary boxes with confidence scores.
5. **Damaged Area**: Exact damaged pixel count and estimated surface area in cm².
6. **Damage Percentage & Severity**: Ratio of damaged pixels to total surface classified into **LOW** (<15%), **MODERATE** (15-30%), or **CRITICAL** (>30%).

### 2. The 5 Analytical Dashboard Graphs
1. **Graph 1: Surface Area Breakdown (Donut Chart)** — Healthy concrete vs damaged crack area with exact pixel ratios.
2. **Graph 2: Radial Severity Gauge** — Speedometer risk index mapping low, moderate, and critical tolerances.
3. **Graph 3: AI Model Benchmark Comparison** — Side-by-side grouped evaluation of **YOLOv8-seg** vs **DeepLabV3+** vs **SAM (ViT-B)** across mIoU, Precision, Recall, F1-Score, and Latency.
4. **Graph 4: Degradation Progression Trend** — 12-month historical line trajectory with alert threshold lines.
5. **Graph 5: Crack Width Distribution (Histogram)** — Defect morphometry categorized into Hairline (<0.2mm), Medium (0.2-1.0mm), and Severe (>1.0mm) fissures.

### 3. Enterprise Distributed Architecture
- **Direct S3 / MinIO Presigned Uploads**: Offloads multi-megabyte image payloads directly from browser to storage without choking API servers.
- **Asynchronous Task Queue (Celery + Redis)**: Background worker fleet with automatic failure recovery (`task_acks_late`).
- **Real-Time WebSocket Streaming**: Instant live status (10% MinIO → 25% Redis → 70% YOLOv8 → 100% Post-processing).
- **Certified PDF Reports**: Client-side instant generation of civil inspection reports via jsPDF.

---

## 🏛️ System Architecture

```
[ User Browser / Drone Feed ]
             │
             ├── 1. Get Presigned URL ──► [ FastAPI Backend :8000 ]
             ├── 2. Direct PUT Upload ──► [ MinIO S3 Object Storage :9000 ]
             ├── 3. Enqueue Job ────────► [ Redis Broker & Pub/Sub :6379 ]
             │                                      │
             │                                      ▼
             │                         [ Celery Worker Fleet (GPU) ]
             │                         ├── Download image from MinIO
             │                         ├── YOLOv8-seg inference
             │                         ├── Generate 6 outputs
             │                         └── Save to PostgreSQL :5432
             │                                      │
             └── 4. WebSocket Progress ◄────────────┘
```

---

## 📁 Repository Structure

```
d:\design project\
├── 📄 docker-compose.yml       # Orchestrates Postgres, Redis, MinIO, Backend, Worker, Frontend
├── 📄 .env                     # Full stack environment variables
├── 📄 PROJECT_BLUEPRINT.md     # Original comprehensive project specifications
│
├── 📁 backend/                 # FastAPI REST API & WebSocket service
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── benchmarks.json         # Comparative model metrics
│   └── app/
│       ├── main.py             # FastAPI entry point & CORS
│       ├── config.py           # Settings management
│       ├── api/                # Upload, Segment, Inspect, Benchmark, WebSocket routes
│       ├── models/             # SQLAlchemy DB models & Pydantic schemas
│       └── services/           # MinIO storage, Celery queue & Redis caching
│
├── 📁 worker/                  # Celery AI Inference Workers
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── benchmarks.json
│   ├── ai_engine/
│   │   └── yolov8_seg.py       # Core YOLOv8-seg engine producing all 6 outputs
│   └── tasks/
│       ├── celery_app.py       # Celery configuration with task_acks_late
│       └── segment_task.py     # Distributed worker pipeline
│
├── 📁 training/                # YOLOv8-seg Model Training Pipeline
│   ├── dataset.yaml            # Dataset configuration
│   ├── prepare_dataset.py      # Mask to YOLO polygon conversion
│   ├── train_yolov8_seg.py     # Training script with augmentation & early stopping
│   ├── evaluate_models.py      # Benchmark evaluation against val set
│   └── requirements.txt
│
└── 📁 frontend/                # Next.js 16 Dark-Themed Executive Dashboard
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── app/
        │   ├── page.tsx        # Dashboard page uniting visualizer, KPIs, 5 charts & table
        │   ├── layout.tsx      # Dark theme & Inter / JetBrains Mono typography
        │   └── globals.css     # Glassmorphism & sleek custom styling
        ├── components/
        │   ├── Header.tsx           # Fleet badges & export actions
        │   ├── ImageUploader.tsx    # Drag-and-drop & demo crack loader
        │   ├── BeforeAfterSlider.tsx# Interactive split slider (Original vs Overlay)
        │   ├── KPICards.tsx         # Damaged Area, Damage %, Risk Tier, Latency
        │   ├── DonutChart.tsx       # Graph 1: Healthy vs Damaged
        │   ├── SeverityGauge.tsx    # Graph 2: Speedometer radial gauge
        │   ├── BenchmarkChart.tsx   # Graph 3: Model comparison bars
        │   ├── DegradationTrend.tsx # Graph 4: Historical 12-month trajectory
        │   ├── CrackHistogram.tsx   # Graph 5: Crack width distribution
        │   ├── InspectionTable.tsx  # Searchable history table + PDF trigger
        │   └── ProcessingStatus.tsx # WebSocket live progress bar
        └── lib/
            ├── api.ts          # REST & WebSocket client with demo fallback
            ├── types.ts        # TypeScript interfaces
            ├── sampleData.ts   # Procedural SVG crack patterns & historical data
            └── pdfExport.ts    # Certified PDF report generation
```

---

## 🚀 Quick Start Guide

### Option 1: Run Full Stack via Docker Compose (Recommended)

Make sure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running, then run:

```bash
cd "d:\design project"
docker compose up --build
```

Access the services:
- **Next.js Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MinIO Storage Console**: [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin123`)

---

### Option 2: Run Frontend Locally (Instant Development)

You can launch the Next.js frontend directly:

```bash
cd "d:\design project\frontend"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip:** Click **"Load Demo Sample"** in the upload panel to immediately preview full YOLOv8-seg defect segmentation, interactive split-sliders, and all 5 analytical charts with zero configuration.

---

### Option 3: Run Model Training Pipeline

To fine-tune YOLOv8-seg on custom crack datasets:

```bash
cd "d:\design project\training"
pip install -r requirements.txt

# 1. Convert masks to YOLO polygons and split train/val
python prepare_dataset.py

# 2. Run GPU training (produces best.pt)
python train_yolov8_seg.py

# 3. Evaluate benchmarks and export metrics
python evaluate_models.py
```

---

## 📄 License & Certification

Designed and developed for critical structural health monitoring, civil infrastructure risk mitigation, and automated drone damage inspection.
