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

class MessageBase(BaseModel):
    id: int
    content: str
    content_type: str
    media_url: Optional[str] = None
    is_read: bool
    created_at: datetime
    sender: UserInfo

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    participant_ids: list[int]
    name: Optional[str] = None

class ConversationBase(BaseModel):
    id: int
    name: Optional[str] = None
    is_group: bool
    created_at: datetime
    updated_at: datetime
    participants: list[UserInfo]

    class Config:
        from_attributes = True

class ConversationDetail(ConversationBase):
    messages: list[MessageBase] = []

class ConversationWithLatestMessage(ConversationBase):
    latest_message: Optional[MessageBase] = None
    unread_count: int = 0
