"""
RAONE - FAISS Vector Store Manager
Manages isolated vector indices per company namespace.
"""

import os
import faiss
import json
import numpy as np
import logging
from typing import List, Dict, Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Ensure data directory exists
os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)


class VectorStore:
    def __init__(self, company_id: str):
        """Initialize vector store for a specific company."""
        self.company_id = str(company_id)
        self.index_path = os.path.join(settings.FAISS_INDEX_PATH, f"{self.company_id}.index")
        self.metadata_path = os.path.join(settings.FAISS_INDEX_PATH, f"{self.company_id}_meta.json")
        self.dimension = 384  # Default for all-MiniLM-L6-v2
        
        # Load or create index
        self._load_or_create()

    def _load_or_create(self):
        """Loads FAISS index and metadata from disk, or creates new ones."""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            logger.info(f"Loading existing FAISS index for company {self.company_id}")
            self.index = faiss.read_index(self.index_path)
            with open(self.metadata_path, 'r', encoding='utf-8') as f:
                self.metadata = json.load(f)
        else:
            logger.info(f"Creating new FAISS index for company {self.company_id}")
            # Use IndexFlatL2 for exact search (L2 distance), suitable for small-medium datasets
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = {}  # Map of index_id (int) -> dict(source_id, source_name, content, chunk_index)

    def _save(self):
        """Saves current index and metadata to disk."""
        faiss.write_index(self.index, self.index_path)
        with open(self.metadata_path, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)

    def add_chunks(self, chunks: List[str], embeddings: List[List[float]], source_id: str, source_name: str):
        """Add new document chunks and corresponding embeddings to the index."""
        if not chunks or not embeddings:
            return

        logger.info(f"Adding {len(chunks)} chunks to index for company {self.company_id}")
        
        # Convert to numpy float32 array
        vectors = np.array(embeddings).astype('float32')
        
        # Determine starting ID for new metadata entries
        start_id = self.index.ntotal
        
        # Add to FAISS
        self.index.add(vectors)
        
        # Add to metadata
        for i, chunk in enumerate(chunks):
            self.metadata[str(start_id + i)] = {
                "source_id": str(source_id),
                "source_name": source_name,
                "content": chunk,
                "chunk_index": i
            }
            
        # Persist to disk
        self._save()
        logger.info("Index successfully saved.")

    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Search the index for the most similar chunks.
        
        Args:
            query_embedding: The dense vector for the user's query.
            top_k: Number of chunks to retrieve. Set high to retrieve "most" relevant context.
        """
        if self.index.ntotal == 0:
            logger.info(f"Index is empty for company {self.company_id}, skipping search.")
            return []

        logger.info(f"Performing vector search for company {self.company_id} (Top K={top_k})")
        
        query_vector = np.array([query_embedding]).astype('float32')
        
        # Retrieve distances and indices. FAISS returns squared L2 distances (lower is better)
        distances, indices = self.index.search(query_vector, min(top_k, self.index.ntotal))
        
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx == -1: # FAISS returns -1 if there aren't enough elements
                continue
                
            idx_str = str(idx)
            if idx_str in self.metadata:
                meta = self.metadata[idx_str]
                # Convert L2 distance to a pseudo-score (just for debugging representation)
                # Max context retrieved as requested by user
                score = 1.0 / (1.0 + float(dist)) 
                
                results.append({
                    "content": meta["content"],
                    "source_name": meta["source_name"],
                    "relevance_score": score,
                    "chunk_index": meta["chunk_index"]
                })
                
        logger.info(f"Found {len(results)} potential matches.")
        return results

    def remove_source(self, source_id: str):
        """Remove all chunks associated with a source_id. (Naïve approach: rebuild index)
        FAISS flat indices don't support targeted deletion easily.
        """
        # This is for Phase 3/Advanced capabilities, but adding placeholder here.
        logger.warning(f"Removing source {source_id} not yet fully supported (requires index rebuild).")
        pass
