"""
RAONE - Conversation Model
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=True)
    session_id: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    source: Mapped[str] = mapped_column(
        String(50), default="dashboard"  # dashboard, api, widget
    )
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    company = relationship("Company", back_populates="conversations")
    messages = relationship(
        "Message",
        back_populates="conversation",
        lazy="selectin",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def __repr__(self):
        return f"<Conversation {self.id}>"
