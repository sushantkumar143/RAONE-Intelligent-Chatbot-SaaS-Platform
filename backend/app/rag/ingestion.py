"""
RAONE - RAG Ingestion Pipeline
Orchestrates text processing, chunking, embedding, and indexing.
"""

import logging
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge_source import KnowledgeSource
from app.utils.text_processing import clean_text
from app.rag.embeddings import generate_embeddings
from app.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into manageable chunks with semantic overlap."""
    if not text:
        return []
    
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        
        # If we're not at the very end, try to find a natural breaking point (like a newline or period)
        if end < text_length:
            # Look backwards from 'end' for a period or newline within the last 100 chars
            break_point = max(text.rfind('\n', start, end), text.rfind('. ', start, end))
            if break_point != -1 and break_point > end - 100:
                end = break_point + 1 # Include the newline/period in the chunk

        chunk = text[start:end].strip()
        if len(chunk) > 10:  # Ignore very short/empty chunks
            chunks.append(chunk)
            
        start = end - overlap
        
    return chunks

async def process_text_source(db: AsyncSession, source: KnowledgeSource) -> None:
    """Full RAG pipeline: clean -> chunk -> embed -> index."""
    try:
        logger.info(f"Starting ingestion pipeline for source: {source.name} (ID: {source.id})")
        
        # 1. Extract content (For text sources, it's stored in metadata during creation)
        raw_text = source.metadata_json.get("full_content", "")
        if not raw_text:
            raise ValueError("No content found in knowledge source.")

        # 2. Clean Text
        logger.info("Cleaning text...")
        cleaned_text = clean_text(raw_text)
        
        # 3. Chunk Text
        logger.info("Chunking text...")
        chunks = chunk_text(cleaned_text, chunk_size=800, overlap=150)
        logger.info(f"Generated {len(chunks)} chunks.")
        
        if not chunks:
             logger.warning("No valid chunks generated.")
             source.status = "failed"
             source.error_message = "Document contained no indexable text."
             await db.commit()
             return

        # 4. Generate Embeddings
        logger.info("Generating embeddings. This runs through the sentence-transformers model...")
        embeddings = generate_embeddings(chunks)
        
        # 5. Index in FAISS
        logger.info("Indexing vectors into FAISS...")
        store = VectorStore(company_id=str(source.company_id))
        store.add_chunks(chunks, embeddings, str(source.id), source.name)
        
        # 6. Update Database Status
        source.status = "completed"
        source.chunk_count = len(chunks)
        
        # Remove massive raw text from metadata to save DB space if desired, 
        # but for now we'll keep it as requested in previous phases.
        
        await db.commit()
        logger.info(f"Ingestion pipeline completed successfully for source: {source.name}")
        
    except Exception as e:
        logger.error(f"Ingestion pipeline failed: {e}", exc_info=True)
        source.status = "failed"
        source.error_message = str(e)
        await db.commit()
