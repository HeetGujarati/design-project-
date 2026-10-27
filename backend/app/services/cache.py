"""
Redis cache service for inspection results caching.
Implements the caching layer from blueprint Section 4.2.4 
with a 60-second TTL for dashboard queries.
"""
import json
from typing import Optional
import redis.asyncio as aioredis
from app.config import get_settings

settings = get_settings()

# Async Redis connection pool
redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=50,
    decode_responses=True,
)


async def get_redis() -> aioredis.Redis:
    """Get an async Redis client from the pool."""
    return aioredis.Redis(connection_pool=redis_pool)


async def cache_get(key: str) -> Optional[dict]:
    """Get cached data by key."""
    r = await get_redis()
    data = await r.get(key)
    if data:
        return json.loads(data)
    return None


async def cache_set(key: str, data: dict, ttl: int = 60):
    """Set cache data with TTL (default 60 seconds per blueprint)."""
    r = await get_redis()
    await r.set(key, json.dumps(data, default=str), ex=ttl)


async def cache_delete(key: str):
    """Invalidate cache entry."""
    r = await get_redis()
    await r.delete(key)


async def publish_progress(task_id: str, data: dict):
    """Publish progress event to Redis Pub/Sub for WebSocket streaming."""
    r = await get_redis()
    await r.publish(f"task:{task_id}", json.dumps(data, default=str))
