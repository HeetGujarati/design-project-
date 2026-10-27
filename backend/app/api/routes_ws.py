"""
WebSocket Routes — /ws/inspection/{task_id}
Real-time progress streaming via Redis Pub/Sub.
Implements blueprint Section 4.2.5: 'Real-Time Status via WebSockets'.
"""
import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis.asyncio as aioredis
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.websocket("/ws/inspection/{task_id}")
async def websocket_inspection_progress(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint for live inspection progress streaming.
    
    Replaces inefficient HTTP polling (blueprint Section 4.2.5).
    The browser opens a persistent connection, and when the Celery worker
    publishes progress events to Redis Pub/Sub, they are immediately
    pushed to the user's dashboard with zero latency.
    
    Progress stages: 
      10% → Image downloaded
      25% → Pre-processing complete
      50% → AI inference running
      70% → Post-processing (mask, overlay, bbox)
      90% → Saving results to database
      100% → Complete
    """
    await websocket.accept()

    r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.subscribe(f"task:{task_id}")

    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "task_id": task_id,
            "status": "connected",
            "progress": 0,
            "message": "Connected to progress stream. Waiting for worker to pick up job...",
        })

        # Listen for progress events from Redis Pub/Sub
        while True:
            message = await asyncio.wait_for(
                pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0),
                timeout=120,  # 2 minute timeout
            )

            if message and message["type"] == "message":
                data = json.loads(message["data"])
                data["task_id"] = task_id
                await websocket.send_json(data)

                # Close connection when job is done
                if data.get("status") in ("completed", "failed"):
                    break

    except (WebSocketDisconnect, asyncio.TimeoutError):
        pass
    except Exception as e:
        await websocket.send_json({
            "task_id": task_id,
            "status": "error",
            "message": str(e),
        })
    finally:
        await pubsub.unsubscribe(f"task:{task_id}")
        await pubsub.close()
        await r.close()
        try:
            await websocket.close()
        except Exception:
            pass
