"""
RAONE - FAISS Vector Store Manager
Manages isolated vector indices per company namespace.
Includes cross-encoder reranking for high-precision retrieval.
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


# ── Reranker (Cross-Encoder) ─────────────────────────────────
# The cross-encoder scores (query, chunk) pairs jointly for much
# higher accuracy than the bi-encoder (embedding) similarity alone.

class Reranker:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            from sentence_transformers import CrossEncoder
            logger.info("Loading cross-encoder reranker: cross-encoder/ms-marco-MiniLM-L-6-v2 ...")
            cls._instance = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', max_length=512)
            logger.info("Reranker loaded successfully.")
        return cls._instance


def rerank_results(query: str, candidates: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Rerank candidate chunks using a cross-encoder for higher precision.
    
    The bi-encoder (FAISS) is fast but approximate.
    The cross-encoder is slower but much more accurate because it
    scores (query, document) pairs jointly.
    """
    if not candidates:
        return []

    reranker = Reranker.get_instance()
    
    # Prepare pairs for the cross-encoder
    pairs = [(query, c["content"]) for c in candidates]
    
    logger.info(f"Reranking {len(pairs)} candidates with cross-encoder...")
    scores = reranker.predict(pairs)
    
    # Attach scores and sort descending (higher = more relevant)
    for i, candidate in enumerate(candidates):
        candidate["rerank_score"] = float(scores[i])
    
    reranked = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
    
    # Log the top results for debugging
    for i, r in enumerate(reranked[:top_n]):
        logger.info(
            f"  Rerank #{i+1}: score={r['rerank_score']:.4f} "
            f"source='{r['source_name']}' "
            f"preview='{r['content'][:80]}...'"
        )
    
    return reranked[:top_n]


# ── FAISS Vector Store ────────────────────────────────────────

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
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner Product (cosine after normalization)
            self.metadata = {}

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
        
        # Convert to numpy float32 array and L2-normalize for cosine similarity
        vectors = np.array(embeddings).astype('float32')
        faiss.normalize_L2(vectors)
        
        start_id = self.index.ntotal
        self.index.add(vectors)
        
        for i, chunk in enumerate(chunks):
            self.metadata[str(start_id + i)] = {
                "source_id": str(source_id),
                "source_name": source_name,
                "content": chunk,
                "chunk_index": i
            }
            
        self._save()
        logger.info(f"Index saved. Total vectors: {self.index.ntotal}")

    def search(self, query_embedding: List[float], top_k: int = 8) -> List[Dict[str, Any]]:
        """
        Two-stage retrieval:
        1. FAISS bi-encoder retrieves top_k * 2 candidates (fast, approximate).
        2. Cross-encoder reranks them to top_k (slow, precise).
        """
        if self.index.ntotal == 0:
            logger.info(f"Index is empty for company {self.company_id}, skipping search.")
            return []

        # Stage 1: Over-fetch candidates from FAISS
        fetch_k = min(top_k * 2, self.index.ntotal)
        logger.info(f"Stage 1: FAISS retrieval for company {self.company_id} (fetching {fetch_k} candidates)")
        
        query_vector = np.array([query_embedding]).astype('float32')
        faiss.normalize_L2(query_vector)  # Normalize query too for cosine sim
        
        scores, indices = self.index.search(query_vector, fetch_k)
        
        candidates = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            idx_str = str(idx)
            if idx_str in self.metadata:
                meta = self.metadata[idx_str]
                candidates.append({
                    "content": meta["content"],
                    "source_name": meta["source_name"],
                    "relevance_score": float(score),  # cosine similarity (higher is better)
                    "chunk_index": meta["chunk_index"]
                })
                
        logger.info(f"Stage 1 returned {len(candidates)} candidates.")
        return candidates  # Reranking happens in chat_service

    def remove_source(self, source_id: str):
        """Remove all chunks associated with a source_id by rebuilding the index."""
        keys_to_remove = [k for k, v in self.metadata.items() if v.get("source_id") == source_id]
        if not keys_to_remove:
            return
            
        logger.info(f"Rebuilding index without source {source_id} ({len(keys_to_remove)} chunks)")
        
        # Collect remaining vectors and metadata
        remaining_meta = {}
        remaining_vectors = []
        new_id = 0
        
        for old_id_str, meta in self.metadata.items():
            if meta.get("source_id") == source_id:
                continue
            old_id = int(old_id_str)
            vec = faiss.rev_swig_ptr(self.index.reconstruct(old_id), self.dimension)
            remaining_vectors.append(np.array(vec))
            remaining_meta[str(new_id)] = meta
            new_id += 1
        
        # Rebuild
        self.index = faiss.IndexFlatIP(self.dimension)
        if remaining_vectors:
            vectors = np.array(remaining_vectors).astype('float32')
            self.index.add(vectors)
        self.metadata = remaining_meta
        self._save()
        logger.info(f"Index rebuilt. Remaining vectors: {self.index.ntotal}")
