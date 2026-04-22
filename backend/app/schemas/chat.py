"""
RAONE - Chat Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[UUID] = None


class PublicChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    session_id: Optional[str] = None


# ── Response Schemas ─────────────────────────────────────

class SourceChunk(BaseModel):
    content: str
    source_name: str
    relevance_score: float
    chunk_index: int = 0


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    sources: Optional[List[SourceChunk]] = None
    response_time: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    message: MessageResponse
    conversation_id: UUID


class ConversationResponse(BaseModel):
    id: UUID
    title: Optional[str] = None
    source: str
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    id: UUID
    title: Optional[str] = None
    messages: List[MessageResponse]
    created_at: datetime

    class Config:
        from_attributes = True
