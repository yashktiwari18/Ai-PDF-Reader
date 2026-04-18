"""
Route: POST /api/summary/generate
Generates an AI summary for a previously uploaded document.
"""

from fastapi import APIRouter, HTTPException, status

from app.models.request_models import SummaryRequest
from app.services.rag_pipeline import generate_summary
from app.utils.helpers import document_store

router = APIRouter()


@router.post(
    "/generate",
    summary="Generate AI document summary",
    description="Given a document_id from a previous upload, generate an AI-powered summary "
                "of the document using the LLM summarization chain.",
)
async def get_summary(request: SummaryRequest):
    # ── Lookup document ───────────────────────────────────────────────────────
    doc = document_store.get(request.document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{request.document_id}' not found. Please upload the PDF first.",
        )

    # ── Generate summary ──────────────────────────────────────────────────────
    try:
        summary_text = generate_summary(
            raw_text=doc["raw_text"],
            max_length=request.max_length,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summary generation failed: {str(exc)}",
        )

    return {
        "document_id": request.document_id,
        "filename": doc["filename"],
        "summary": summary_text,
    }


@router.get(
    "/{document_id}",
    summary="Get cached summary",
    description="Returns the cached summary for a document if it was already generated.",
)
async def get_cached_summary(document_id: str):
    doc = document_store.get(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )
    cached = doc.get("summary")
    if not cached:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No summary generated yet for this document. Call POST /generate first.",
        )
    return {"document_id": document_id, "summary": cached}
