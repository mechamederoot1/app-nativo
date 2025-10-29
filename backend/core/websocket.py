from socketio import AsyncServer
from websocket.handlers import AuthHandler, ChatHandler, NotificationHandler
from websocket.services import ConnectionService
from websocket import sio

# Initialize connection service
connection_service = ConnectionService()

# Initialize handlers
auth_handler = AuthHandler()
chat_handler = ChatHandler(sio, connection_service)
notification_handler = NotificationHandler(sio, connection_service)


@sio.event
async def connect(sid, environ, auth):
    """Handle new socket connection"""
    try:
        user = await authenticate_socket(auth)
        await manager.connect(user.id, sid)
        print(f"User {user.id} connected with sid {sid}")
    except Exception as e:
        print(f"Connection error: {e}")
        raise e


@sio.event
async def disconnect(sid):
    """Handle socket disconnection"""
    await manager.disconnect(sid)
    print(f"Client {sid} disconnected")


# ============= PROFILE VISIT EVENTS =============

async def emit_visit_notification(visited_user_id: int, visitor_id: int, visitor_name: str, visitor_avatar: str = None):
    """Emit profile visit notification to the visited user"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="profile_visit",
            user_id=visited_user_id,
            actor_id=visitor_id,
            actor_name=visitor_name,
            actor_avatar=visitor_avatar,
            message=f"{visitor_name} visitou seu perfil"
        )
        
        # Save notification to database
        notification = Notification(
            user_id=visited_user_id,
            type="profile_visit",
            actor_id=visitor_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        # Emit to user if online
        if manager.is_user_online(visited_user_id):
            await sio.emit('profile_visit', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == visited_user_id
                for sid in sids
            ])
    finally:
        db.close()


# ============= FRIEND REQUEST EVENTS =============

async def emit_friend_request_notification(receiver_id: int, sender_id: int, sender_name: str, sender_avatar: str = None):
    """Emit friend request notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="friend_request",
            user_id=receiver_id,
            actor_id=sender_id,
            actor_name=sender_name,
            actor_avatar=sender_avatar,
            message=f"{sender_name} enviou uma solicitação de amizade"
        )
        
        # Save notification
        notification = Notification(
            user_id=receiver_id,
            type="friend_request",
            actor_id=sender_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        # Emit to user if online
        if manager.is_user_online(receiver_id):
            await sio.emit('friend_request', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == receiver_id
                for sid in sids
            ])
    finally:
        db.close()


async def emit_friend_request_accepted(requester_id: int, accepter_id: int, accepter_name: str, accepter_avatar: str = None):
    """Emit friend request accepted notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="friend_request_accepted",
            user_id=requester_id,
            actor_id=accepter_id,
            actor_name=accepter_name,
            actor_avatar=accepter_avatar,
            message=f"{accepter_name} aceitou sua solicitação de amizade"
        )
        
        notification = Notification(
            user_id=requester_id,
            type="friend_request_accepted",
            actor_id=accepter_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(requester_id):
            await sio.emit('friend_request_accepted', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == requester_id
                for sid in sids
            ])
    finally:
        db.close()


# ============= POST EVENTS (Comments, Likes, Shares) =============

async def emit_post_comment(post_id: int, post_author_id: int, commenter_id: int, commenter_name: str, commenter_avatar: str = None, comment_text: str = ""):
    """Emit post comment notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="post_comment",
            user_id=post_author_id,
            actor_id=commenter_id,
            actor_name=commenter_name,
            actor_avatar=commenter_avatar,
            message=comment_text[:100],
            related_id=post_id,
            related_type="post"
        )
        
        notification = Notification(
            user_id=post_author_id,
            type="post_comment",
            actor_id=commenter_id,
            related_id=post_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(post_author_id):
            await sio.emit('post_comment', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == post_author_id
                for sid in sids
            ])
    finally:
        db.close()


async def emit_post_like(post_id: int, post_author_id: int, liker_id: int, liker_name: str, liker_avatar: str = None):
    """Emit post like notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="post_like",
            user_id=post_author_id,
            actor_id=liker_id,
            actor_name=liker_name,
            actor_avatar=liker_avatar,
            message=f"{liker_name} curtiu seu post",
            related_id=post_id,
            related_type="post"
        )
        
        notification = Notification(
            user_id=post_author_id,
            type="post_like",
            actor_id=liker_id,
            related_id=post_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(post_author_id):
            await sio.emit('post_like', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == post_author_id
                for sid in sids
            ])
    finally:
        db.close()


async def emit_post_share(post_id: int, post_author_id: int, sharer_id: int, sharer_name: str, sharer_avatar: str = None):
    """Emit post share notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="post_share",
            user_id=post_author_id,
            actor_id=sharer_id,
            actor_name=sharer_name,
            actor_avatar=sharer_avatar,
            message=f"{sharer_name} compartilhou seu post",
            related_id=post_id,
            related_type="post"
        )
        
        notification = Notification(
            user_id=post_author_id,
            type="post_share",
            actor_id=sharer_id,
            related_id=post_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(post_author_id):
            await sio.emit('post_share', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == post_author_id
                for sid in sids
            ])
    finally:
        db.close()


# ============= MESSAGE EVENTS =============

async def emit_message(receiver_id: int, sender_id: int, sender_name: str, sender_avatar: str = None, message_text: str = ""):
    """Emit new message notification"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type="message",
            user_id=receiver_id,
            actor_id=sender_id,
            actor_name=sender_name,
            actor_avatar=sender_avatar,
            message=message_text[:100]
        )
        
        notification = Notification(
            user_id=receiver_id,
            type="message",
            actor_id=sender_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(receiver_id):
            await sio.emit('message', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == receiver_id
                for sid in sids
            ])
    finally:
        db.close()


# ============= REACTION EVENTS =============

async def emit_reaction(target_type: str, target_id: int, target_author_id: int, reactor_id: int, reactor_name: str, reactor_avatar: str = None, reaction: str = "👍"):
    """Emit reaction notification (for comments, posts, etc.)"""
    db = SessionLocal()
    try:
        notification_data = create_notification_data(
            event_type=f"{target_type}_reaction",
            user_id=target_author_id,
            actor_id=reactor_id,
            actor_name=reactor_name,
            actor_avatar=reactor_avatar,
            message=f"{reactor_name} reagiu com {reaction}",
            related_id=target_id,
            related_type=target_type
        )
        
        notification = Notification(
            user_id=target_author_id,
            type=f"{target_type}_reaction",
            actor_id=reactor_id,
            related_id=target_id,
            data=notification_data
        )
        db.add(notification)
        db.commit()
        
        if manager.is_user_online(target_author_id):
            await sio.emit(f'{target_type}_reaction', notification_data, to=[
                sid for uid, sids in manager.active_connections.items()
                if uid == target_author_id
                for sid in sids
            ])
    finally:
        db.close()
