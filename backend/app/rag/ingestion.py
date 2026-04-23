"""
RAONE - RAG Ingestion Pipeline
Orchestrates semantic chunking, embedding, and indexing.
"""

import re
import logging
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.knowledge_source import KnowledgeSource
from app.utils.text_processing import clean_text
from app.rag.embeddings import generate_embeddings
from app.rag.vector_store import VectorStore

logger = logging.getLogger(__name__)

# ── Semantic Chunking ─────────────────────────────────────────
# Each chunk should have a distinct meaning (200-400 tokens ≈ 800-1600 chars).
# We split on semantic boundaries (headings, double newlines, sentence ends)
# and ensure overlap so context is never lost at chunk boundaries.

def _split_into_sentences(text: str) -> List[str]:
    """Split text into sentences using regex."""
    # Split on sentence-ending punctuation followed by whitespace
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def _split_into_paragraphs(text: str) -> List[str]:
    """Split text on double newlines (semantic paragraph boundaries)."""
    paragraphs = re.split(r'\n\s*\n', text)
    return [p.strip() for p in paragraphs if p.strip()]

def chunk_text_semantic(text: str, target_tokens: int = 300, overlap_tokens: int = 50) -> List[str]:
    """
    Semantic chunking: splits text into chunks of ~target_tokens (1 token ≈ 4 chars).
    
    Strategy:
    1. Split into paragraphs first (natural semantic boundaries).
    2. If a paragraph is too long, split it into sentences.
    3. Accumulate sentences until we hit the target size.
    4. Add overlap from the end of the previous chunk for continuity.
    
    This ensures each chunk has DISTINCT meaning rather than
    dumping arbitrary character windows.
    """
    if not text:
        return []

    target_chars = target_tokens * 4   # ~1200 chars for 300 tokens
    overlap_chars = overlap_tokens * 4  # ~200 chars overlap

    paragraphs = _split_into_paragraphs(text)
    
    # Flatten paragraphs into sentences while preserving paragraph breaks
    all_sentences = []
    for para in paragraphs:
        sentences = _split_into_sentences(para)
        all_sentences.extend(sentences)
    
    if not all_sentences:
        # Fallback: if no sentence boundaries found, do character-level chunking
        return _chunk_by_chars(text, target_chars, overlap_chars)

    chunks = []
    current_chunk_sentences = []
    current_length = 0

    for sentence in all_sentences:
        sentence_len = len(sentence)
        
        # If adding this sentence would exceed target, finalize current chunk
        if current_length + sentence_len > target_chars and current_chunk_sentences:
            chunk_text = ' '.join(current_chunk_sentences)
            chunks.append(chunk_text)
            
            # Overlap: carry over last few sentences
            overlap_sentences = []
            overlap_len = 0
            for s in reversed(current_chunk_sentences):
                if overlap_len + len(s) > overlap_chars:
                    break
                overlap_sentences.insert(0, s)
                overlap_len += len(s)
            
            current_chunk_sentences = overlap_sentences
            current_length = overlap_len
        
        current_chunk_sentences.append(sentence)
        current_length += sentence_len

    # Don't forget the last chunk
    if current_chunk_sentences:
        chunk_text = ' '.join(current_chunk_sentences)
        if len(chunk_text) > 30:  # Skip trivially short final chunks
            chunks.append(chunk_text)

    logger.info(f"Semantic chunking produced {len(chunks)} chunks (target ~{target_tokens} tokens each)")
    return chunks


def _chunk_by_chars(text: str, chunk_size: int, overlap: int) -> List[str]:
    """Fallback character-level chunking with overlap."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            # Try to break at a sentence boundary
            break_point = max(text.rfind('. ', start, end), text.rfind('\n', start, end))
            if break_point > start + chunk_size // 2:
                end = break_point + 1
        chunk = text[start:end].strip()
        if len(chunk) > 30:
            chunks.append(chunk)
        start = end - overlap
    return chunks


# ── Ingestion Pipeline ────────────────────────────────────────

async def process_text_source(db: AsyncSession, source: KnowledgeSource) -> None:
    """Full RAG pipeline: clean -> semantic chunk -> embed -> index."""
    try:
        logger.info(f"Starting ingestion pipeline for source: {source.name} (ID: {source.id})")
        
        # 1. Extract content
        raw_text = source.metadata_json.get("full_content", "")
        if not raw_text:
            raise ValueError("No content found in knowledge source.")

        # 2. Clean Text
        logger.info("Cleaning text...")
        cleaned_text = clean_text(raw_text)
        
        # 3. Semantic Chunking (200-400 token target with overlap)
        logger.info("Performing semantic chunking (target: 300 tokens per chunk, 50 token overlap)...")
        chunks = chunk_text_semantic(cleaned_text, target_tokens=300, overlap_tokens=50)
        logger.info(f"Generated {len(chunks)} semantic chunks.")
        
        if not chunks:
             logger.warning("No valid chunks generated.")
             source.status = "failed"
             source.error_message = "Document contained no indexable text."
             await db.commit()
             return

        # 4. Generate Embeddings
        logger.info("Generating embeddings via sentence-transformers...")
        embeddings = generate_embeddings(chunks)
        
        # 5. Index in FAISS
        logger.info("Indexing vectors into FAISS...")
        store = VectorStore(company_id=str(source.company_id))
        store.add_chunks(chunks, embeddings, str(source.id), source.name)
        
        # 6. Update Database Status
        source.status = "completed"
        source.chunk_count = len(chunks)
        
        await db.commit()
        logger.info(f"Ingestion pipeline completed successfully for source: {source.name}")
        
    except Exception as e:
        logger.error(f"Ingestion pipeline failed: {e}", exc_info=True)
        source.status = "failed"
        source.error_message = str(e)
        await db.commit()
