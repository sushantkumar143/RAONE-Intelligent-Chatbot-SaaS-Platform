"""
RAONE - Knowledge Router
API endpoints for managing and ingesting knowledge sources.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.middleware.auth_middleware import get_current_company
from app.models.company import Company
from app.schemas.knowledge import (
    TextIngestionRequest, 
    KnowledgeSourceResponse, 
    KnowledgeSourceListResponse,
    IngestionStatusResponse
)
from app.services import knowledge_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("/sources", response_model=KnowledgeSourceListResponse)
async def list_sources(
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """List all knowledge sources for the current company."""
    sources = await knowledge_service.get_knowledge_sources(db, company.id)
    return KnowledgeSourceListResponse(
        sources=[KnowledgeSourceResponse.model_validate(s) for s in sources],
        total=len(sources)
    )

@router.post("/text", response_model=IngestionStatusResponse, status_code=status.HTTP_201_CREATED)
async def ingest_text(
    data: TextIngestionRequest,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Ingest raw text into the knowledge base."""
    source = await knowledge_service.ingest_text(db, company.id, data)
    
    return IngestionStatusResponse(
        source_id=source.id,
        status=source.status,
        chunk_count=source.chunk_count,
        message=f"Text source '{source.name}' successfully ingested."
    )

from fastapi import UploadFile, File
from app.schemas.knowledge import UrlScrapeRequest
import uuid

@router.post("/upload", response_model=IngestionStatusResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Upload and ingest a file."""
    try:
        source = await knowledge_service.ingest_file(db, company.id, file)
        return IngestionStatusResponse(
            source_id=source.id,
            status=source.status,
            chunk_count=source.chunk_count,
            message=f"File '{source.name}' successfully uploaded and is processing."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/scrape", response_model=IngestionStatusResponse, status_code=status.HTTP_201_CREATED)
async def scrape_url(
    data: UrlScrapeRequest,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Scrape and ingest a URL."""
    try:
        source = await knowledge_service.ingest_url(db, company.id, data.url)
        return IngestionStatusResponse(
            source_id=source.id,
            status=source.status,
            chunk_count=source.chunk_count,
            message=f"URL '{data.url}' successfully scraped and is processing."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    company: Company = Depends(get_current_company)
):
    """Delete a knowledge source."""
    success = await knowledge_service.delete_source(db, source_id, company.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

