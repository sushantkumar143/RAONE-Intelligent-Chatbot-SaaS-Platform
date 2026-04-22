"""
RAONE - Knowledge Service
Handles business logic for knowledge source management and ingestion.
"""

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge_source import KnowledgeSource
from app.schemas.knowledge import TextIngestionRequest
from app.rag.ingestion import process_text_source
from app.utils.file_parser import extract_text_from_upload, extract_text_from_url
from fastapi import UploadFile
import asyncio



async def get_knowledge_sources(db: AsyncSession, company_id: uuid.UUID) -> List[KnowledgeSource]:
    """Fetch all knowledge sources for a specific company."""
    result = await db.execute(
        select(KnowledgeSource)
        .where(KnowledgeSource.company_id == company_id)
        .order_by(KnowledgeSource.created_at.desc())
    )
    return list(result.scalars().all())

async def ingest_text(
    db: AsyncSession, 
    company_id: uuid.UUID, 
    data: TextIngestionRequest
) -> KnowledgeSource:
    """Ingest raw text as a knowledge source."""
    # Create knowledge source record
    new_source = KnowledgeSource(
        company_id=company_id,
        source_type="text",
        name=data.title,
        content_preview=data.content[:200] + "..." if len(data.content) > 200 else data.content,
        status="processing",  # Status will update after RAG pipeline completes
        chunk_count=0,
        metadata_json={
            "full_content": data.content
        }
    )
    
    db.add(new_source)
    await db.commit()
    await db.refresh(new_source)
    
    # Trigger RAG Pipeline (Ideally as a proper Celery backgroud task, but asyncio.create_task for now)
    # Note: For production with FastAPI, background tasks should be attached to the response.
    # To keep it simple and testable immediately, we await it here for the log trace to show up synchronously
    # but in a real app we'd use FastAPI's BackgroundTasks.
    # We will await it directly so the user sees the logs in the console in real-time.
    await process_text_source(db, new_source)
    
    return new_source


async def get_source_by_id(db: AsyncSession, source_id: uuid.UUID) -> Optional[KnowledgeSource]:
    """Fetch a specific knowledge source by ID."""
    result = await db.execute(
        select(KnowledgeSource).where(KnowledgeSource.id == source_id)
    )
    return result.scalar_one_or_none()

async def ingest_file(db: AsyncSession, company_id: uuid.UUID, file: UploadFile) -> KnowledgeSource:
    """Extract text from an uploaded file and ingest it."""
    try:
        content = await extract_text_from_upload(file)
    except Exception as e:
        raise ValueError(f"Failed to process file: {str(e)}")
        
    new_source = KnowledgeSource(
        company_id=company_id,
        source_type="document",
        name=file.filename,
        content_preview=content[:200] + ("..." if len(content) > 200 else ""),
        status="processing",
        chunk_count=0,
        metadata_json={"full_content": content}
    )
    db.add(new_source)
    await db.commit()
    await db.refresh(new_source)
    
    await process_text_source(db, new_source)
    return new_source

async def ingest_url(db: AsyncSession, company_id: uuid.UUID, url: str) -> KnowledgeSource:
    """Scrape text from a URL and ingest it."""
    try:
        title, content = extract_text_from_url(url)
    except Exception as e:
        raise ValueError(f"Failed to process URL: {str(e)}")
        
    new_source = KnowledgeSource(
        company_id=company_id,
        source_type="url",
        name=title,
        content_preview=content[:200] + ("..." if len(content) > 200 else ""),
        status="processing",
        chunk_count=0,
        metadata_json={"full_content": content, "url": url}
    )
    db.add(new_source)
    await db.commit()
    await db.refresh(new_source)
    
    await process_text_source(db, new_source)
    return new_source

async def delete_source(db: AsyncSession, source_id: uuid.UUID, company_id: uuid.UUID) -> bool:
    """Delete a knowledge source and ideally its chunks from the vector store."""
    result = await db.execute(
        select(KnowledgeSource).where(
            KnowledgeSource.id == source_id,
            KnowledgeSource.company_id == company_id
        )
    )
    source = result.scalar_one_or_none()
    if not source:
        return False
        
    # Note: Proper FAISS deletion requires index rebuilding which might be slow.
    # For now, we will simply remove the database record so it doesn't show up.
    # True namespace isolation usually dictates rebuilding index without that source_id eventually.
    
    await db.delete(source)
    await db.commit()
    return True

