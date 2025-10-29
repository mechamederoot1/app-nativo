from datetime import datetime
from sqlalchemy.orm import Session
from database.models import Conversation, Message, User
from database.session import SessionLocal

class ChatService:
    """Business logic for chat operations"""
    
    @staticmethod
    def create_conversation(user_ids: list[int], name: str = None, created_by_id: int = None) -> Conversation:
        """Create a new conversation"""
        db = SessionLocal()
        try:
            participants = db.query(User).filter(User.id.in_(user_ids)).all()
            
            conversation = Conversation(
                name=name,
                is_group=len(user_ids) > 2,
                created_by_id=created_by_id or user_ids[0]
            )
            conversation.participants = participants
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            return conversation
        finally:
            db.close()
    
    @staticmethod
    def get_conversation(conversation_id: int) -> Conversation | None:
        """Get conversation by ID"""
        db = SessionLocal()
        try:
            return db.query(Conversation).filter(Conversation.id == conversation_id).first()
        finally:
            db.close()
    
    @staticmethod
    def get_user_conversations(user_id: int, limit: int = 50, offset: int = 0):
        """Get all conversations for a user"""
        db = SessionLocal()
        try:
            conversations = db.query(Conversation).join(
                Conversation.participants
            ).filter(
                User.id == user_id
            ).order_by(
                Conversation.updated_at.desc()
            ).limit(limit).offset(offset).all()
            return conversations
        finally:
            db.close()
    
    @staticmethod
    def create_message(
        conversation_id: int,
        sender_id: int,
        content: str,
        content_type: str = "text",
        media_url: str = None
    ) -> Message:
        """Create a new message"""
        db = SessionLocal()
        try:
            message = Message(
                conversation_id=conversation_id,
                sender_id=sender_id,
                content=content,
                content_type=content_type,
                media_url=media_url
            )
            db.add(message)
            
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id
            ).first()
            if conversation:
                conversation.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(message)
            return message
        finally:
            db.close()
    
    @staticmethod
    def get_messages(conversation_id: int, limit: int = 50, offset: int = 0):
        """Get messages from a conversation"""
        db = SessionLocal()
        try:
            messages = db.query(Message).filter(
                Message.conversation_id == conversation_id
            ).order_by(
                Message.created_at.desc()
            ).limit(limit).offset(offset).all()
            return list(reversed(messages))
        finally:
            db.close()
    
    @staticmethod
    def mark_message_as_read(message_id: int):
        """Mark a message as read"""
        db = SessionLocal()
        try:
            message = db.query(Message).filter(Message.id == message_id).first()
            if message:
                message.is_read = True
                db.commit()
            return message
        finally:
            db.close()
    
    @staticmethod
    def mark_conversation_messages_as_read(conversation_id: int, user_id: int = None):
        """Mark all messages in a conversation as read"""
        db = SessionLocal()
        try:
            query = db.query(Message).filter(
                Message.conversation_id == conversation_id,
                Message.is_read == False
            )
            if user_id:
                query = query.filter(Message.sender_id != user_id)
            
            query.update({Message.is_read: True})
            db.commit()
        finally:
            db.close()
    
    @staticmethod
    def get_unread_count(conversation_id: int, user_id: int = None) -> int:
        """Get count of unread messages in a conversation"""
        db = SessionLocal()
        try:
            query = db.query(Message).filter(
                Message.conversation_id == conversation_id,
                Message.is_read == False
            )
            if user_id:
                query = query.filter(Message.sender_id != user_id)
            
            return query.count()
        finally:
            db.close()
    
    @staticmethod
    def get_or_create_dm_conversation(user_id_1: int, user_id_2: int) -> Conversation:
        """Get or create a direct message conversation between two users"""
        db = SessionLocal()
        try:
            conversation = db.query(Conversation).join(
                Conversation.participants
            ).filter(
                Conversation.is_group == False,
                User.id.in_([user_id_1, user_id_2])
            ).group_by(Conversation.id).having(
                db.func.count(User.id) == 2
            ).first()
            
            if conversation:
                return conversation
            
            participants = db.query(User).filter(User.id.in_([user_id_1, user_id_2])).all()
            conversation = Conversation(
                is_group=False,
                created_by_id=user_id_1
            )
            conversation.participants = participants
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            return conversation
        finally:
            db.close()
