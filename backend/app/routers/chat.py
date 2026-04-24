"""
RAONE - Chat Router
API endpoints for managing conversations and messages.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.database import get_db
from app.middleware.auth_middleware import get_current_company
from app.models.company import Company
from app.schemas.chat import (
    ConversationResponse, 
    ConversationDetailResponse,
    MessageResponse,
    ChatRequest,
    ChatResponse
)
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def chat_with_ai(
    data: ChatRequest,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Send a message to the AI and get a response."""
    try:
        message, conversation_id = await chat_service.process_chat_message(
            db, company.id, data.message, data.conversation_id
        )
        return ChatResponse(
            message=MessageResponse.model_validate(message),
            conversation_id=conversation_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/conversations", response_model=List[ConversationResponse])

async def list_conversations(
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """List all conversations for the current company."""
    conversations = await chat_service.get_conversations(db, company.id)
    return [ConversationResponse.model_validate(c) for c in conversations]

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation_detail(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Get details and messages of a specific conversation."""
    conversation = await chat_service.get_conversation_by_id(db, conversation_id, company.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    messages = await chat_service.get_conversation_messages(db, conversation_id)
    
    return ConversationDetailResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        messages=[MessageResponse.model_validate(m) for m in messages]
    )

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Get all messages for a specific conversation."""
    conversation = await chat_service.get_conversation_by_id(db, conversation_id, company.id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    messages = await chat_service.get_conversation_messages(db, conversation_id)
    return [MessageResponse.model_validate(m) for m in messages]

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_new_conversation(
    title: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Create a new conversation."""
    conversation = await chat_service.create_conversation(db, company.id, title)
    return ConversationResponse.model_validate(conversation)
