"""
RAONE - Public Chat Router
API endpoints accessible via API key (headless / widget integration).
No JWT required — authentication is done through the X-API-Key header.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.middleware.api_key_auth import get_company_by_api_key
from app.models.company import Company
from app.services import chat_service
from app.schemas.chat import MessageResponse


class PublicChatRequest(BaseModel):
    """Request body for public chat endpoint."""
    message: str
    conversation_id: Optional[uuid.UUID] = None


class PublicChatResponse(BaseModel):
    """Response body for public chat endpoint."""
    reply: str
    conversation_id: uuid.UUID
    sources: Optional[list] = None


router = APIRouter(prefix="/public", tags=["Public API"])


@router.post("/chat", response_model=PublicChatResponse, status_code=status.HTTP_200_OK)
async def public_chat(
    data: PublicChatRequest,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_company_by_api_key),
):
    """
    Send a message and get an AI response.

    This endpoint is designed for external integrations (mobile apps, widgets,
    third-party services). Authenticate using the X-API-Key header.

    - **message**: The user's question or message.
    - **conversation_id**: (Optional) Continue an existing conversation.
    """
    try:
        assistant_msg, conversation_id = await chat_service.process_chat_message(
            db, company.id, data.message, data.conversation_id
        )
        return PublicChatResponse(
            reply=assistant_msg.content,
            conversation_id=conversation_id,
            sources=assistant_msg.sources,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your request: {str(e)}",
        )
