"""
Pydantic request/response models for the DocuMind AI API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class SummaryRequest(BaseModel):
    """Request body for POST /api/summary/generate"""

    document_id: str = Field(
        ...,
        description="The document_id returned by the /api/upload/pdf endpoint.",
        example="3f7a1b2c-84d5-4e9a-b123-abc123456789",
    )
    max_length: int = Field(
        default=200,
        ge=50,
        le=1000,
        description="Approximate word count for the generated summary (50–1000).",
    )


class ChatRequest(BaseModel):
    """Request body for POST /api/chat/ask"""

    document_id: str = Field(
        ...,
        description="The document_id returned by the /api/upload/pdf endpoint.",
        example="3f7a1b2c-84d5-4e9a-b123-abc123456789",
    )
    question: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="The natural-language question to ask about the document.",
        example="What are the main findings of this paper?",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of document chunks to retrieve for context (1–20).",
    )


class UploadResponse(BaseModel):
    """Response body for POST /api/upload/pdf"""

    document_id: str
    filename: str
    chunk_count: int
    message: str


class SummaryResponse(BaseModel):
    """Response body for POST /api/summary/generate"""

    document_id: str
    filename: str
    summary: str


class ChatResponse(BaseModel):
    """Response body for POST /api/chat/ask"""

    document_id: str
    question: str
    answer: str
    source_chunks: list[str] = []
