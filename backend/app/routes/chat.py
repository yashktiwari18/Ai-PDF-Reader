"""
Route: POST /api/chat/ask
Answers a user question using RAG over a previously uploaded document.
"""

from fastapi import APIRouter, HTTPException, status

from app.models.request_models import ChatRequest
from app.services.rag_pipeline import answer_question
from app.utils.helpers import document_store

router = APIRouter()


@router.post(
    "/ask",
    summary="Ask a question about the document",
    description="Given a document_id and a natural-language question, retrieve the most "
                "relevant chunks via FAISS and generate a grounded answer using the LLM.",
)
async def ask_question(request: ChatRequest):
    # ── Lookup document ───────────────────────────────────────────────────────
    doc = document_store.get(request.document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{request.document_id}' not found. Please upload the PDF first.",
        )

    vector_store = doc.get("vector_store")
    if not vector_store:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vector store for this document was not built correctly. Re-upload the PDF.",
        )

    # ── RAG answer ────────────────────────────────────────────────────────────
    try:
        result = answer_question(
            question=request.question,
            vector_store=vector_store,
            top_k=request.top_k,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question answering failed: {str(exc)}",
        )

    return {
        "document_id": request.document_id,
        "question": request.question,
        "answer": result["answer"],
        "source_chunks": result.get("source_chunks", []),
    }


@router.get(
    "/history/{document_id}",
    summary="Get chat history for a document",
    description="Returns the list of Q&A pairs recorded for this document session.",
)
async def get_chat_history(document_id: str):
    doc = document_store.get(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found.",
        )
    return {
        "document_id": document_id,
        "history": doc.get("chat_history", []),
    }
