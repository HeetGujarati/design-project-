FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and GPU support
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["celery", "-A", "tasks.celery_app", "worker", "--loglevel=info", "--concurrency=2"]
