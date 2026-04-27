"""
RAONE - Company & CompanyMember Models
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    subscription_plan: Mapped[str] = mapped_column(String(50), default="free")
    subscription_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_blacklisted: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    owner = relationship("User", back_populates="owned_companies", lazy="selectin")
    members = relationship("CompanyMember", back_populates="company", lazy="selectin", cascade="all, delete-orphan")
    api_keys = relationship("ApiKey", back_populates="company", lazy="selectin", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="company", lazy="noload", cascade="all, delete-orphan")
    knowledge_sources = relationship("KnowledgeSource", back_populates="company", lazy="selectin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Company {self.name}>"


class CompanyMember(Base):
    __tablename__ = "company_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(50), default="member")  # owner, admin, member
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    company = relationship("Company", back_populates="members")
    user = relationship("User", back_populates="memberships")

    def __repr__(self):
        return f"<CompanyMember {self.user_id} in {self.company_id}>"
