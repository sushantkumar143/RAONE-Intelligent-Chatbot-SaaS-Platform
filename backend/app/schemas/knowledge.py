"""
RAONE - Knowledge Base Schemas
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────

class TextIngestionRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=10)


class UrlScrapeRequest(BaseModel):
    url: str = Field(..., min_length=5)
    name: Optional[str] = None


# ── Response Schemas ─────────────────────────────────────

class KnowledgeSourceResponse(BaseModel):
    id: UUID
    source_type: str
    name: str
    original_filename: Optional[str] = None
    content_preview: Optional[str] = None
    status: str
    chunk_count: int
    file_size: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class KnowledgeSourceListResponse(BaseModel):
    sources: List[KnowledgeSourceResponse]
    total: int


class IngestionStatusResponse(BaseModel):
    source_id: UUID
    status: str
    chunk_count: int
    message: str
