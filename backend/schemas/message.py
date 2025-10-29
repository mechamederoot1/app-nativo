from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class UserInfo(BaseModel):
    id: int
    username: str
    first_name: str
    last_name: str
    profile_photo: Optional[str] = None

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str
    content_type: str = "text"
    media_url: Optional[str] = None

class MessageBase(BaseModel):
    id: int
    conversation_id: int
    content: str
    content_type: str
    media_url: Optional[str] = None
    is_read: bool
    created_at: datetime
    sender: UserInfo

    class Config:
        from_attributes = True
