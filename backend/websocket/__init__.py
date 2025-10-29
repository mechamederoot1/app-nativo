from socketio import AsyncServer
from core.config import settings

sio = AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_timeout=60,
    ping_interval=25,
)

__all__ = ['sio']
