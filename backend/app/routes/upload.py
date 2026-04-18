"""
Routes: /api/upload/

  POST /api/upload/pdf        → Full RAG pipeline upload (embed + vector store)
  POST /api/upload/upload-pdf → Lightweight upload: save to disk only,
                                ready for downstream processing
  GET  /api/upload/files      → List all saved PDFs in uploads/
  DELETE /api/upload/files/{filename} → Delete a saved PDF
"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from app.services.file_manager import (
    is_valid_pdf,
    save_upload,
    delete_file,
    list_uploaded_files,
)
from app.services.pdf_reader import extract_text_from_pdf
from app.services.text_chunker import split_into_chunks
from app.services.embeddings import build_vector_store
from app.utils.helpers import save_temp_file, cleanup_temp_file, document_store

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  1.  POST /upload-pdf
#      Lightweight endpoint: validate → save to uploads/ → return metadata.
#      Designed so processing hooks (OCR, NLP, RAG) can be added later without
#      touching the route logic — just call the relevant service functions.
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/upload-pdf",
    summary="Upload and save a PDF file",
    description=(
        "Accepts a PDF file, validates it, saves it to the `uploads/` folder "
        "on the server, and returns the saved filename plus a success message. "
        "No AI processing is triggered here — this endpoint is intentionally "
        "kept thin so PDF processing services can be wired in independently."
    ),
    status_code=status.HTTP_201_CREATED,
)
async def upload_pdf_to_disk(file: UploadFile = File(...)):
    """
    Steps:
      1. Reject non-PDF files immediately (MIME + extension check).
      2. Reject empty files.
      3. Save to uploads/ via file_manager.save_upload().
      4. Return success response with file metadata.

    Hook points for future integration:
      - After step 3: call pdf_reader.extract_text_from_pdf(result["file_path"])
      - After extraction: call text_chunker.split_into_chunks(raw_text)
      - After chunking: call embeddings.build_vector_store(chunks)
    """
    # ── Step 1: File type validation ──────────────────────────────────────────
    if not is_valid_pdf(file):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={
                "error": "Invalid file type",
                "message": "Only PDF files are accepted. Please upload a .pdf file.",
                "received_type": file.content_type or "unknown",
            },
        )

    # ── Step 2: Empty file guard ──────────────────────────────────────────────
    # Read first byte to check emptiness; seek back before saving
    first_byte = await file.read(1)
    if not first_byte:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Empty file",
                "message": "The uploaded PDF file is empty. Please upload a valid PDF.",
            },
        )
    await file.seek(0)  # reset so save_upload() reads the full file

    # ── Step 3: Save to uploads/ ──────────────────────────────────────────────
    try:
        saved = await save_upload(file)
    except IOError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "File save failed",
                "message": str(exc),
            },
        )

    # ── Step 4: Success response ──────────────────────────────────────────────
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "success": True,
            "message": f"'{saved['original_name']}' uploaded successfully.",
            "file": {
                "original_name": saved["original_name"],
                "saved_filename": saved["saved_filename"],
                "size_bytes": saved["size_bytes"],
                "size_kb": round(saved["size_bytes"] / 1024, 2),
            },
            # Hint: call POST /api/upload/pdf to trigger full AI processing
            "next_step": "POST /api/upload/pdf to process this file with AI",
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
#  2.  GET /files — list all uploaded PDFs
# ─────────────────────────────────────────────────────────────────────────────
@router.get(
    "/files",
    summary="List all uploaded PDF files",
    description="Returns metadata for every PDF currently saved in the uploads/ directory.",
)
async def list_files():
    files = list_uploaded_files()
    return {
        "total": len(files),
        "files": files,
    }


# ─────────────────────────────────────────────────────────────────────────────
#  3.  DELETE /files/{filename} — remove an uploaded PDF
# ─────────────────────────────────────────────────────────────────────────────
@router.delete(
    "/files/{filename}",
    summary="Delete an uploaded PDF file",
    description="Delete a previously uploaded PDF from the uploads/ directory by filename.",
)
async def remove_file(filename: str):
    # Basic path traversal guard
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    deleted = delete_file(filename)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File '{filename}' not found in uploads/.",
        )
    return {"success": True, "message": f"'{filename}' deleted successfully."}


# ─────────────────────────────────────────────────────────────────────────────
#  4.  POST /pdf — full RAG pipeline (existing endpoint, kept for AI chat flow)
# ─────────────────────────────────────────────────────────────────────────────
@router.post(
    "/pdf",
    summary="Upload PDF and run full AI pipeline",
    description=(
        "Upload a PDF, extract text, chunk it, build a FAISS vector store, "
        "and return a document_id for the summary and chat endpoints."
    ),
    status_code=status.HTTP_201_CREATED,
)
async def upload_pdf_full_pipeline(file: UploadFile = File(...)):
    if not is_valid_pdf(file):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted.",
        )

    filename = file.filename or "upload.pdf"
    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    temp_path = save_temp_file(file_bytes, filename)

    try:
        raw_text = extract_text_from_pdf(temp_path)
        if not raw_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No extractable text found (the PDF may be scanned/image-based).",
            )

        chunks = split_into_chunks(raw_text)
        vector_store = build_vector_store(chunks)

        document_id = str(uuid.uuid4())
        document_store[document_id] = {
            "filename": filename,
            "raw_text": raw_text,
            "chunks": chunks,
            "vector_store": vector_store,
            "summary": None,
            "chat_history": [],
        }

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "document_id": document_id,
                "filename": filename,
                "chunk_count": len(chunks),
                "message": "PDF processed successfully. Use document_id for summary and chat.",
            },
        )
    finally:
        cleanup_temp_file(temp_path)
