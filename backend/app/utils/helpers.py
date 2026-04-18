"""
Utility helpers for file I/O and in-memory document storage.
"""

import os
import tempfile
import uuid
from pathlib import Path

# ── In-memory document store ──────────────────────────────────────────────────
# Maps document_id (str) → dict containing:
#   "filename"     : str
#   "raw_text"     : str
#   "chunks"       : List[str]
#   "vector_store" : { "index": faiss.IndexFlatIP, "chunks": List[str] }
#   "summary"      : str  (populated after /summary/generate call)
#   "chat_history" : List[dict]  (populated with each /chat/ask call)
#
# NOTE: This is cleared on server restart. For persistence, replace with
#       a database (e.g., SQLite / PostgreSQL + a vector DB like Qdrant).
document_store: dict = {}


# ── Temp file helpers ─────────────────────────────────────────────────────────
def save_temp_file(file_bytes: bytes, original_filename: str) -> str:
    """
    Write `file_bytes` to a temporary file and return its path.
    The caller is responsible for deleting it via `cleanup_temp_file`.

    Args:
        file_bytes:        Raw bytes of the uploaded file.
        original_filename: Original filename (used for the suffix).

    Returns:
        Absolute path to the created temp file.
    """
    suffix = Path(original_filename).suffix or ".pdf"
    tmp = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
        prefix=f"documind_{uuid.uuid4().hex}_",
    )
    tmp.write(file_bytes)
    tmp.flush()
    tmp.close()
    return tmp.name


def cleanup_temp_file(file_path: str) -> None:
    """
    Delete a temporary file if it exists. Silently ignores missing files.

    Args:
        file_path: Path to the temp file to remove.
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        pass


# ── Misc helpers ──────────────────────────────────────────────────────────────
def truncate_text(text: str, max_words: int = 8000) -> str:
    """Truncate text to `max_words` words to stay within LLM context limits."""
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words])


def format_source_chunks(chunks: list[str], max_chars: int = 300) -> list[str]:
    """
    Trim each source chunk to `max_chars` characters for cleaner API responses.
    Appends '…' if truncated.
    """
    formatted = []
    for chunk in chunks:
        if len(chunk) > max_chars:
            formatted.append(chunk[:max_chars].rstrip() + "…")
        else:
            formatted.append(chunk)
    return formatted
