"""
Service: file_manager.py
Handles all local file I/O for uploaded PDFs.

Keeping this isolated from routes makes it trivial to swap in
cloud storage (S3, GCS) or a DB-backed store later.
"""

import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile

# ── Upload directory ──────────────────────────────────────────────────────────
# Resolved relative to this file's location so it works regardless of cwd.
BASE_DIR = Path(__file__).resolve().parent.parent.parent   # backend/
UPLOAD_DIR = BASE_DIR / "uploads"


def ensure_upload_dir() -> Path:
    """Create the uploads/ directory if it doesn't already exist."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    return UPLOAD_DIR


def is_valid_pdf(file: UploadFile) -> bool:
    """
    Validate that the uploaded file is a PDF by checking:
      1. MIME content-type header
      2. File extension fallback
    """
    allowed_mime = {"application/pdf", "application/octet-stream"}
    content_type_ok = (file.content_type or "").lower() in allowed_mime
    extension_ok = (file.filename or "").lower().endswith(".pdf")
    return content_type_ok or extension_ok


def build_safe_filename(original_filename: str) -> str:
    """
    Return a collision-safe filename:
      <uuid>_<original_name>
    Strips any path components from the original name to prevent
    directory traversal attacks.
    """
    safe_name = Path(original_filename).name  # strip any leading paths
    unique_prefix = uuid.uuid4().hex[:8]
    return f"{unique_prefix}_{safe_name}"


async def save_upload(file: UploadFile) -> dict:
    """
    Persist an UploadFile to the uploads/ directory.

    Args:
        file: The FastAPI UploadFile object from the request.

    Returns:
        dict with keys:
            - saved_filename : str  (the unique filename on disk)
            - original_name  : str  (the original filename from the client)
            - file_path      : str  (absolute path to the saved file)
            - size_bytes     : int  (file size in bytes)

    Raises:
        IOError: If the file cannot be written to disk.
    """
    upload_dir = ensure_upload_dir()
    saved_filename = build_safe_filename(file.filename or "upload.pdf")
    dest_path = upload_dir / saved_filename

    try:
        with dest_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise IOError(f"Failed to save file to disk: {exc}") from exc
    finally:
        await file.seek(0)   # reset cursor in case caller wants to read again

    size_bytes = dest_path.stat().st_size

    return {
        "saved_filename": saved_filename,
        "original_name": file.filename or "unknown.pdf",
        "file_path": str(dest_path),
        "size_bytes": size_bytes,
    }


def delete_file(saved_filename: str) -> bool:
    """
    Remove a previously saved file from uploads/.

    Args:
        saved_filename: The unique filename returned by save_upload().

    Returns:
        True if deleted, False if not found.
    """
    target = UPLOAD_DIR / saved_filename
    if target.exists():
        target.unlink()
        return True
    return False


def list_uploaded_files() -> list[dict]:
    """Return metadata for all PDFs currently in the uploads/ directory."""
    ensure_upload_dir()
    files = []
    for f in UPLOAD_DIR.iterdir():
        if f.is_file() and f.suffix.lower() == ".pdf":
            files.append({
                "filename": f.name,
                "size_bytes": f.stat().st_size,
                "modified": f.stat().st_mtime,
            })
    return sorted(files, key=lambda x: x["modified"], reverse=True)
