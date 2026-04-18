"""
Service: text_chunker.py
Splits raw text into overlapping chunks for embedding and retrieval.
"""

from typing import List


def split_into_chunks(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
) -> List[str]:
    """
    Split `text` into overlapping word-based chunks.

    Args:
        text:           The raw document text to split.
        chunk_size:     Target number of words per chunk.
        chunk_overlap:  Number of words to overlap between consecutive chunks.
                        Overlap preserves context at chunk boundaries.

    Returns:
        A list of text chunks (strings). Returns an empty list if `text` is empty.
    """
    if not text or not text.strip():
        return []

    words = text.split()
    chunks: List[str] = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        chunks.append(chunk_text)

        # Advance by (chunk_size - overlap) so consecutive chunks share context
        start += chunk_size - chunk_overlap

        # Safety: avoid infinite loop if overlap ≥ chunk_size
        if chunk_overlap >= chunk_size:
            break

    return chunks


def split_by_paragraphs(text: str, min_words: int = 50) -> List[str]:
    """
    Alternative chunking strategy: split on blank lines (paragraphs)
    and merge short paragraphs with the previous one.

    Args:
        text:       The raw text to split.
        min_words:  Minimum word count for a standalone paragraph chunk.

    Returns:
        List of paragraph-based text chunks.
    """
    raw_paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    merged: List[str] = []
    buffer = ""

    for para in raw_paragraphs:
        buffer = (buffer + "\n\n" + para).strip() if buffer else para
        if len(buffer.split()) >= min_words:
            merged.append(buffer)
            buffer = ""

    if buffer:
        merged.append(buffer)

    return merged
