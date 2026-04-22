"""
RAONE - Company Router
Manage company profile and stats.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.api_key import ApiKey
from app.models.knowledge_source import KnowledgeSource
from app.schemas.company import CompanyResponse, CompanyUpdate, CompanyStatsResponse
from app.middleware.auth_middleware import get_current_user, get_current_company
from app.models.user import User

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/current", response_model=CompanyResponse)
async def get_current_company_info(
    company: Company = Depends(get_current_company),
):
    """Get the current user's company info."""
    return CompanyResponse.model_validate(company)


@router.patch("/current", response_model=CompanyResponse)
async def update_company(
    data: CompanyUpdate,
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    """Update the current company's info."""
    if data.name is not None:
        company.name = data.name
    if data.description is not None:
        company.description = data.description
    if data.settings is not None:
        company.settings = data.settings

    db.add(company)
    return CompanyResponse.model_validate(company)


@router.get("/current/stats", response_model=CompanyStatsResponse)
async def get_company_stats(
    company: Company = Depends(get_current_company),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard stats for the current company."""
    # Total conversations
    conv_count = await db.execute(
        select(func.count(Conversation.id)).where(Conversation.company_id == company.id)
    )
    total_conversations = conv_count.scalar() or 0

    # Total messages
    msg_count = await db.execute(
        select(func.count(Message.id))
        .join(Conversation, Message.conversation_id == Conversation.id)
        .where(Conversation.company_id == company.id)
    )
    total_messages = msg_count.scalar() or 0

    # Knowledge sources
    ks_count = await db.execute(
        select(func.count(KnowledgeSource.id)).where(KnowledgeSource.company_id == company.id)
    )
    total_knowledge_sources = ks_count.scalar() or 0

    # Active API keys
    ak_count = await db.execute(
        select(func.count(ApiKey.id)).where(
            ApiKey.company_id == company.id,
            ApiKey.is_active == True,
        )
    )
    active_api_keys = ak_count.scalar() or 0

    return CompanyStatsResponse(
        total_conversations=total_conversations,
        total_messages=total_messages,
        total_knowledge_sources=total_knowledge_sources,
        active_api_keys=active_api_keys,
    )
