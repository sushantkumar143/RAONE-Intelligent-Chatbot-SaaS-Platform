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

    # 2.5 Fetch Company to check subscription plan
    from app.models.company import Company
    company = await db.execute(select(Company).where(Company.id == company_id))
    company_obj = company.scalar_one_or_none()
    plan = company_obj.subscription_plan if company_obj else "free"
    account_type = company_obj.settings.get("account_type", "business") if company_obj and company_obj.settings else "business"

    # 2.6 Perform Vector Retrieval + Reranking
    logger.info("Generating query embedding for RAG retrieval...")
    query_embedding = generate_single_embedding(message_text)
    
    store = VectorStore(company_id=str(company_id))
    if plan in ["pro", "ultra_pro"]:
        logger.info(f"Stage 1: Premium Hybrid Search for plan {plan}...")
        candidates = store.hybrid_search(message_text, query_embedding, top_k=8)
    else:
        logger.info("Stage 1: Searching vector store (bi-encoder)...")
        candidates = store.search(query_embedding, top_k=8) 
    
    # Stage 2: Rerank with cross-encoder for precision
    from app.rag.vector_store import rerank_results
    retrieved_chunks = rerank_results(message_text, candidates, top_n=5)
    
    # Format retrieved context
    context_str = ""
    sources_used = []
    if retrieved_chunks:
        logger.info(f"Reranking complete. Using top {len(retrieved_chunks)} chunks for prompt augmentation.")
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks):
            content = chunk['content']
            context_parts.append(f"[Source {i+1}: {chunk['source_name']}]\n{content}")
            sources_used.append({
                "source_name": chunk['source_name'],
                "relevance_score": chunk.get('rerank_score', chunk['relevance_score']),
                "content": content[:100] + "...",
                "chunk_index": chunk['chunk_index']
            })
        context_str = "\n\n".join(context_parts)
    else:
        logger.info("No relevant chunks found in the knowledge base.")

    if not context_str and account_type == "personal":
        logger.info("No RAG context found for personal user. Performing real-time web search...")
        try:
            from duckduckgo_search import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(message_text, max_results=3))
            
            if results:
                web_parts = []
                for i, res in enumerate(results):
                    web_parts.append(f"[Web Source {i+1}: {res['title']}]\nURL: {res['href']}\n{res['body']}")
                    sources_used.append({
                        "source_name": res['title'] + " (Web)",
                        "relevance_score": 1.0,
                        "content": res['body'][:100] + "...",
                        "chunk_index": i
                    })
                context_str = "\n\n".join(web_parts)
                logger.info(f"Web search successful. Found {len(results)} results.")
        except Exception as e:
            logger.error(f"Web search failed: {e}")

    # 3. Prepare message history for LLM with STRICT extraction prompt
    history = await get_conversation_messages(db, conversation_id)
    
    # Build the system prompt — force the LLM to synthesize, not summarize
    if context_str:
        system_prompt = (
            "You are RAONE, an expert AI assistant. "
            "Answer ONLY using the provided context below.\n\n"
            "RULES:\n"
            "- Extract SPECIFIC mechanisms, facts, and details — not general ideas.\n"
            "- Combine multiple pieces of information from different sources if needed.\n"
            "- If partial information exists, infer carefully but DO NOT hallucinate.\n"
            "- If the context does not contain enough information, say \"Insufficient information in the knowledge base.\"\n"
            "- Always cite which source(s) you used.\n"
            "- Be precise, direct, and actionable.\n\n"
            "CONTEXT:\n"
            "---------------------\n"
            f"{context_str}\n"
            "---------------------\n"
        )
    else:
        system_prompt = (
            "You are RAONE, an expert AI assistant. "
            "No knowledge base context was found for this query. "
            "Answer using your general knowledge, but clearly state that "
            "this answer is NOT from the company's knowledge base.\n"
        )

    llm_messages = [{"role": "system", "content": system_prompt}]
    
    for m in history:
        llm_messages.append({"role": m.role, "content": m.content})
    
    # 4. Generate LLM response
    import time
    start_time = time.time()
    try:
        logger.info("Sending augmented prompt to LLM...")
        llm_result = await generate_response(llm_messages)
        ai_response_content = llm_result["content"]
        input_tokens = llm_result["input_tokens"]
        output_tokens = llm_result["output_tokens"]
        model_used = llm_result["model"]
    except Exception as e:
        logger.error(f"LLM Generation failed: {e}")
        ai_response_content = "I'm sorry, I encountered an error while processing your request. Please try again later."
        input_tokens = 0
        output_tokens = 0
        model_used = "error"
    
    response_time = time.time() - start_time
    logger.info(f"LLM replied in {response_time:.2f} seconds.")

    # 5. Save assistant message
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_response_content,
        response_time=response_time,
        sources=sources_used if sources_used else None,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        model_used=model_used
    )
    db.add(assistant_msg)

    # Update conversation timestamp
    conversation.updated_at = func.now()
    
    await db.commit()
    await db.refresh(assistant_msg)
    
    return assistant_msg, conversation_id


