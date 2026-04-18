"""
Service: embeddings.py
Builds a FAISS vector store from text chunks using sentence-transformers embeddings.
"""

from typing import List
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load the embedding model once at module level (cached in memory)
# Using a lightweight but capable model for semantic search
_MODEL_NAME = "all-MiniLM-L6-v2"
_embedder: SentenceTransformer | None = None


def _get_embedder() -> SentenceTransformer:
    """Lazy-load the embedding model (singleton pattern)."""
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer(_MODEL_NAME)
    return _embedder


def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Convert a list of text strings into a 2-D NumPy array of embeddings.

    Args:
        texts: List of strings to embed.

    Returns:
        Float32 numpy array of shape (len(texts), embedding_dim).
    """
    embedder = _get_embedder()
    embeddings = embedder.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.astype(np.float32)


def build_vector_store(chunks: List[str]) -> dict:
    """
    Build and return an in-memory FAISS index together with the raw chunks.

    Args:
        chunks: List of text chunks to index.

    Returns:
        A dict with keys:
            - "index"  : faiss.IndexFlatL2 object
            - "chunks" : the original list of text chunks (for retrieval)
    """
    if not chunks:
        raise ValueError("Cannot build a vector store from an empty chunk list.")

    vectors = embed_texts(chunks)
    dim = vectors.shape[1]

    # Use inner-product (cosine-like) index after L2-normalizing vectors
    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(dim)  # Inner product ≈ cosine similarity after normalization
    index.add(vectors)

    return {"index": index, "chunks": chunks}


def similarity_search(
    query: str,
    vector_store: dict,
    top_k: int = 5,
) -> List[str]:
    """
    Find the `top_k` most semantically similar chunks to `query`.

    Args:
        query:        The user's natural-language query.
        vector_store: Dict returned by `build_vector_store`.
        top_k:        Number of top chunks to return.

    Returns:
        List of the most relevant text chunks (strings).
    """
    index: faiss.IndexFlatIP = vector_store["index"]
    chunks: List[str] = vector_store["chunks"]

    query_vec = embed_texts([query])
    faiss.normalize_L2(query_vec)

    # Clamp top_k to the number of indexed chunks
    k = min(top_k, index.ntotal)
    _, indices = index.search(query_vec, k)

    return [chunks[i] for i in indices[0] if i != -1]
