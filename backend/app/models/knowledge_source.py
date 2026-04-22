"""
RAONE - Knowledge Source Model
Tracks ingested data sources per company.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, Text, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False  # file, url, text
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=True)
    content_preview: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="processing"  # processing, completed, failed
    )
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    file_size: Mapped[int] = mapped_column(Integer, nullable=True)  # bytes
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    company = relationship("Company", back_populates="knowledge_sources")

    def __repr__(self):
        return f"<KnowledgeSource {self.name} ({self.source_type})>"
