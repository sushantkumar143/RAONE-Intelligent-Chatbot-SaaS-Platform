"""
RAONE - Embeddings Wrapper
Handles text embeddings using sentence-transformers.
"""

import logging
from typing import List
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingModel:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL} (this may take a moment on first run)...")
            cls._instance = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Embedding model loaded successfully.")
        return cls._instance

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate dense vector embeddings for a list of texts."""
    logger.info(f"Generating embeddings for batch of {len(texts)} chunks...")
    model = EmbeddingModel.get_instance()
    
    # We use numpy conversion just in case, though sentence-transformers usually returns numpy arrays or tensors
    embeddings = model.encode(texts, show_progress_bar=False)
    
    # Return as list of lists (floats) for easy use with FAISS
    return embeddings.tolist()

def generate_single_embedding(text: str) -> List[float]:
    """Generate a dense vector embedding for a single text string."""
    return generate_embeddings([text])[0]
