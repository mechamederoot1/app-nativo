from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User, Conversation, Message
from schemas.conversation import ConversationCreate, ConversationWithLatestMessage, ConversationDetail
from schemas.message import MessageBase, MessageCreate
from websocket.services import ChatService
from dependencies import get_current_user

router = APIRouter()

chat_service = ChatService()

@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
):
    """Get all conversations for the current user"""
    conversations = chat_service.get_user_conversations(
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )
    
    result = []
    for conv in conversations:
        unread_count = chat_service.get_unread_count(
            conversation_id=conv.id,
            user_id=current_user.id
        )
        latest_message = None
        if conv.messages:
            latest_msg = conv.messages[-1]
            latest_message = {
                "id": latest_msg.id,
                "content": latest_msg.content,
                "content_type": latest_msg.content_type,
                "media_url": latest_msg.media_url,
                "is_read": latest_msg.is_read,
                "created_at": latest_msg.created_at.isoformat(),
                "sender": {
                    "id": latest_msg.sender.id,
                    "username": latest_msg.sender.username,
                    "first_name": latest_msg.sender.first_name,
                    "last_name": latest_msg.sender.last_name,
                    "profile_photo": latest_msg.sender.profile_photo,
                }
            }
        
        participants = [
            {
                "id": p.id,
                "username": p.username,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "profile_photo": p.profile_photo,
            }
            for p in conv.participants
        ]
        
        result.append({
            "id": conv.id,
            "name": conv.name,
            "is_group": conv.is_group,
            "participants": participants,
            "latest_message": latest_message,
            "unread_count": unread_count,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
        })
    
    return result


@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
):
    """Create a new conversation"""
    try:
        conversation = chat_service.create_conversation(
            user_ids=data.participant_ids,
            name=data.name,
            created_by_id=current_user.id
        )
        
        participants = [
            {
                "id": p.id,
                "username": p.username,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "profile_photo": p.profile_photo,
            }
            for p in conversation.participants
        ]
        
        return {
            "id": conversation.id,
            "name": conversation.name,
            "is_group": conversation.is_group,
            "participants": participants,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
):
    """Get messages from a conversation"""
    conversation = chat_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    participant_ids = [p.id for p in conversation.participants]
    if current_user.id not in participant_ids:
        raise HTTPException(status_code=403, detail="Not a participant of this conversation")
    
    # Mark messages as read
    chat_service.mark_conversation_messages_as_read(conversation_id, current_user.id)
    
    messages = chat_service.get_messages(conversation_id, limit, offset)
    
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "content": msg.content,
            "content_type": msg.content_type,
            "media_url": msg.media_url,
            "is_read": msg.is_read,
            "created_at": msg.created_at.isoformat(),
            "sender": {
                "id": msg.sender.id,
                "username": msg.sender.username,
                "first_name": msg.sender.first_name,
                "last_name": msg.sender.last_name,
                "profile_photo": msg.sender.profile_photo,
            }
        })
    
    return result


@router.get("/conversations/{user_id}/dm")
async def get_or_create_dm(
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    """Get or create a direct message conversation with a specific user"""
    try:
        conversation = chat_service.get_or_create_dm_conversation(
            user_id_1=current_user.id,
            user_id_2=user_id
        )
        
        participants = [
            {
                "id": p.id,
                "username": p.username,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "profile_photo": p.profile_photo,
            }
            for p in conversation.participants
        ]
        
        return {
            "id": conversation.id,
            "name": conversation.name,
            "is_group": conversation.is_group,
            "participants": participants,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
