"""
RAONE - Chat Service
Handles business logic for conversations and messages.
"""

import uuid
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.models.message import Message
from app.services.llm_service import generate_response
from app.rag.vector_store import VectorStore
from app.rag.embeddings import generate_single_embedding
import logging

logger = logging.getLogger(__name__)


async def get_conversations(db: AsyncSession, company_id: uuid.UUID) -> List[Conversation]:
    """Fetch all conversations for a specific company."""
    # We can also join with Message to get message counts if needed, 
    # but for now we'll rely on the relationship or simple fetch.
    result = await db.execute(
        select(Conversation)
        .where(Conversation.company_id == company_id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())

async def get_conversation_by_id(
    db: AsyncSession, 
    conversation_id: uuid.UUID,
    company_id: Optional[uuid.UUID] = None
) -> Optional[Conversation]:
    """Fetch a specific conversation by ID, optionally validating company ownership."""
    query = select(Conversation).where(Conversation.id == conversation_id)
    if company_id:
        query = query.where(Conversation.company_id == company_id)
    
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_conversation(
    db: AsyncSession, 
    company_id: uuid.UUID, 
    title: Optional[str] = None
) -> Conversation:
    """Create a new conversation."""
    conversation = Conversation(
        company_id=company_id,
        title=title or "New Conversation"
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation

async def get_conversation_messages(
    db: AsyncSession, 
    conversation_id: uuid.UUID
) -> List[Message]:
    """Fetch all messages for a specific conversation."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())

async def process_chat_message(
    db: AsyncSession,
    company_id: uuid.UUID,
    message_text: str,
    conversation_id: Optional[uuid.UUID] = None
) -> tuple[Message, uuid.UUID]:
    """Process a chat message: save user msg, get LLM response, save assistant msg."""
    # 1. Get or create conversation
    if not conversation_id:
        conversation = await create_conversation(db, company_id, title=message_text[:50])
        conversation_id = conversation.id
    else:
        conversation = await get_conversation_by_id(db, conversation_id, company_id)
        if not conversation:
            raise ValueError("Conversation not found")

    # 2. Save user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=message_text
    )
    db.add(user_msg)
    await db.flush()

    # 2.5 Perform Vector Retrieval
    logger.info("Generating query embedding for RAG retrieval...")
    query_embedding = generate_single_embedding(message_text)
    
    logger.info("Searching vector store...")
    store = VectorStore(company_id=str(company_id))
    # Fetch top 5 chunks as requested "most of the chunks"
    retrieved_chunks = store.search(query_embedding, top_k=5) 
    
    # Format retrieved context
    context_str = ""
    sources_used = []
    if retrieved_chunks:
        logger.info(f"Retrieved {len(retrieved_chunks)} relevant chunks. Augmenting prompt.")
        context_str = "Context information is below.\n---------------------\n"
        for i, chunk in enumerate(retrieved_chunks):
            # Limit the context size a bit per chunk if they are too long
            content = chunk['content']
            context_str += f"[Source {i+1}: {chunk['source_name']}]\n{content}\n\n"
            sources_used.append({
                "source_name": chunk['source_name'],
                "relevance_score": chunk['relevance_score'],
                "content": content[:100] + "..." # Just preview for db
            })
        context_str += "---------------------\n"
    else:
        logger.info("No relevant chunks found in the knowledge base.")

    # 3. Prepare message history for LLM
    history = await get_conversation_messages(db, conversation_id)
    
    system_prompt = (
        "You are RAONE, a sophisticated AI assistant capable of answering questions. "
        "Use the provided context to answer the user's question accurately. "
        "If you don't know the answer based on the context, say so, but you can also use your general knowledge if appropriate.\n\n"
    )
    if context_str:
        system_prompt += context_str

    llm_messages = [{"role": "system", "content": system_prompt}]
    
    for m in history:
        llm_messages.append({"role": m.role, "content": m.content})
    
    # 4. Generate LLM response
    import time
    start_time = time.time()
    try:
        logger.info("Sending augmented prompt to LLM...")
        ai_response_content = await generate_response(llm_messages)
    except Exception as e:
        logger.error(f"LLM Generation failed: {e}")
        ai_response_content = "I'm sorry, I encountered an error while processing your request. Please try again later."
    
    response_time = time.time() - start_time
    logger.info(f"LLM replied in {response_time:.2f} seconds.")

    # 5. Save assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response_content,
        response_time=response_time,
        sources=sources_used if sources_used else None
    )
    db.add(assistant_msg)

    
    # Update conversation timestamp
    conversation.updated_at = func.now()
    
    await db.commit()
    await db.refresh(assistant_msg)
    
    return assistant_msg, conversation_id

