from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.session import Base

class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    visitor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    visited_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    visited_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    visitor = relationship("User", foreign_keys=[visitor_id], backref="visits_made")
    visited_user = relationship("User", foreign_keys=[visited_user_id], backref="visits_received")
