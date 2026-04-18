"""
Service: rag_pipeline.py
Orchestrates retrieval-augmented generation (RAG) for:
  - Document summarization
  - Question answering (Q&A)

Uses google.generativeai SDK directly (avoids langchain v1beta endpoint issues).
Model preference order: gemini-2.0-flash → gemini-1.5-flash → gemini-pro
Falls back to local extractive summary if no API key or all models fail.
"""

import os
import re
from typing import List

from app.services.embeddings import similarity_search

# ── Model candidates (tried in order) ────────────────────────────────────────
_MODEL_CANDIDATES = [
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-lite",
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro-latest",
    "models/gemini-pro",
]


def _get_genai():
    """
    Configure and return the google.generativeai module.
    Returns None if GOOGLE_API_KEY is not set.
    """
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        return genai
    except Exception:
        return None


def _call_gemini(prompt: str) -> str:
    """
    Try each model candidate in order until one succeeds.
    Raises RuntimeError if all candidates fail.
    """
    genai = _get_genai()
    if genai is None:
        raise RuntimeError("GOOGLE_API_KEY not set")

    last_error = None
    for model_name in _MODEL_CANDIDATES:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=1024,
                ),
            )
            return response.text.strip()
        except Exception as e:
            last_error = e
            # Try the next model
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


# ── Local (offline) fallback helpers ─────────────────────────────────────────
def _extractive_summary(raw_text: str, max_sentences: int = 8) -> str:
    """
    Simple extractive summary using TF scoring — works offline, no API needed.
    """
    sentences = re.split(r'(?<=[.!?])\s+', raw_text.strip())
    sentences = [s.strip() for s in sentences if len(s.split()) > 5]
    if not sentences:
        return raw_text[:600]

    stop_words = {
        'the','a','an','and','or','but','in','on','at','to','for','of',
        'with','by','from','is','are','was','were','be','been','has','have',
        'had','do','does','did','will','would','could','should','may','might',
        'this','that','these','those','it','its','page',
    }
    word_freq: dict[str, int] = {}
    for sentence in sentences:
        for word in sentence.lower().split():
            word = re.sub(r'[^a-z]', '', word)
            if word and word not in stop_words:
                word_freq[word] = word_freq.get(word, 0) + 1

    scores = []
    for sent in sentences:
        score = sum(
            word_freq.get(re.sub(r'[^a-z]', '', w.lower()), 0)
            for w in sent.split()
        )
        scores.append((score, sent))

    top_sentences = sorted(scores, reverse=True)[:max_sentences]
    top_texts = {s for _, s in top_sentences}
    ordered = [s for s in sentences if s in top_texts]

    return " ".join(ordered[:max_sentences])


def _keyword_answer(question: str, relevant_chunks: List[str]) -> str:
    """Simple keyword-based answer from retrieved chunks — works offline."""
    question_words = set(re.sub(r'[^a-z\s]', '', question.lower()).split())
    stop_words = {'what','is','the','a','an','of','in','for','to','and','or','how','why','when','where','who'}
    keywords = question_words - stop_words

    best_chunk = ""
    best_score = -1
    for chunk in relevant_chunks:
        score = sum(1 for kw in keywords if kw in chunk.lower())
        if score > best_score:
            best_score = score
            best_chunk = chunk

    if not best_chunk and relevant_chunks:
        best_chunk = relevant_chunks[0]

    return best_chunk[:800] + ("…" if len(best_chunk) > 800 else "")


# ── Summarization ─────────────────────────────────────────────────────────────
def generate_summary(raw_text: str, max_length: int = 200) -> str:
    """
    Summarize raw_text using Gemini.
    Falls back to extractive summary if API is unavailable or fails.
    """
    # Truncate to ~8000 words to stay within context window
    words = raw_text.split()
    truncated = " ".join(words[:8000]) if len(words) > 8000 else raw_text

    prompt = f"""You are an expert document analyst.
Summarize the following document concisely in approximately {max_length} words.
Focus on key findings, methodology, and conclusions.
Do NOT add information that is not in the document.

Document:
{truncated}

Summary:"""

    # Try Gemini first
    if os.getenv("GOOGLE_API_KEY", "").strip():
        try:
            return _call_gemini(prompt)
        except Exception as exc:
            # Gemini failed — fall through to extractive
            fallback = _extractive_summary(raw_text, max_sentences=8)
            return f"⚠️ Gemini error: {exc}\n\nAuto-generated summary:\n\n{fallback}"

    # No API key — use offline extractive fallback
    return _extractive_summary(raw_text, max_sentences=10)


# ── Question Answering ────────────────────────────────────────────────────────
def answer_question(
    question: str,
    vector_store: dict,
    top_k: int = 5,
) -> dict:
    """
    Retrieve top-k relevant chunks and generate a grounded answer.
    Falls back to keyword extraction if API unavailable.
    """
    relevant_chunks: List[str] = similarity_search(question, vector_store, top_k=top_k)
    context = "\n\n---\n\n".join(relevant_chunks)

    prompt = f"""You are a precise document assistant.
Answer the question using ONLY the context provided below.
If the answer is not in the context, say: "I couldn't find this information in the document."
Do NOT make up any information.

Context:
{context}

Question: {question}

Answer:"""

    if os.getenv("GOOGLE_API_KEY", "").strip():
        try:
            answer = _call_gemini(prompt)
            return {"answer": answer, "source_chunks": relevant_chunks}
        except Exception as exc:
            fallback = _keyword_answer(question, relevant_chunks)
            return {
                "answer": f"⚠️ Gemini error: {exc}\n\n{fallback}",
                "source_chunks": relevant_chunks,
            }

    # No API key — keyword fallback
    return {
        "answer": _keyword_answer(question, relevant_chunks),
        "source_chunks": relevant_chunks,
    }
