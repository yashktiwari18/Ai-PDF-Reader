"""
DocuMind AI — FastAPI Backend
Entry point: app/main.py
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly resolve backend/.env so it loads correctly regardless of cwd
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, summary, chat

# ── App initialization ──────────────────────────────────────────────────────
app = FastAPI(
    title="DocuMind AI API",
    description="Backend for AI-powered PDF summarization and document chat (RAG).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Allow the React dev server (port 5173) and any production origin you deploy to.
origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # CRA fallback
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router registration ───────────────────────────────────────────────────────
app.include_router(upload.router,  prefix="/api/upload",  tags=["Upload"])
app.include_router(summary.router, prefix="/api/summary", tags=["Summary"])
app.include_router(chat.router,    prefix="/api/chat",    tags=["Chat"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "DocuMind AI API is running."}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}
