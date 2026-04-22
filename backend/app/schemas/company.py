"""
RAONE - Company Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    settings: Optional[dict] = None


class CompanyResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    settings: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyStatsResponse(BaseModel):
    total_conversations: int = 0
    total_messages: int = 0
    total_knowledge_sources: int = 0
    active_api_keys: int = 0
