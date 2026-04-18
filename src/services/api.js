/**
 * API Service — real fetch calls to the FastAPI backend.
 * Base URL is read from VITE_API_URL (see .env) or defaults to localhost:8000.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Shared error handler — parses FastAPI-style error detail payloads.
 * FastAPI returns { detail: string | object } on errors.
 */
async function handleResponse(res) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = typeof err.detail === 'string'
        ? err.detail
        : JSON.stringify(err.detail);
    } catch {
      // ignore parse error, keep generic message
    }
    throw new Error(message);
  }
  return res.json();
}

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Upload a PDF and run the full AI pipeline (chunking + FAISS indexing).
 * Returns a document_id used for all subsequent calls.
 *
 * @param {File} file - The PDF File object from the user
 * @param {(pct: number) => void} [onProgress] - optional progress callback (0-100)
 * @returns {Promise<{ document_id: string, filename: string, chunk_count: number, message: string }>}
 */
export async function uploadPDF(file, onProgress) {
  const form = new FormData();
  form.append('file', file);

  // Use XMLHttpRequest so we can get real upload progress events
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid JSON from server'));
        }
      } else {
        let message = `HTTP ${xhr.status}`;
        try {
          const err = JSON.parse(xhr.responseText);
          message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } catch { /* ignore */ }
        reject(new Error(message));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', `${BASE_URL}/api/upload/pdf`);
    xhr.send(form);
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────

/**
 * Generate an AI summary for an already-uploaded document.
 *
 * @param {string} documentId - The document_id returned by uploadPDF()
 * @param {number} [maxLength=200] - Approximate word count for the summary
 * @returns {Promise<string>} - The summary text
 */
export async function getSummary(documentId, maxLength = 200) {
  const res = await fetch(`${BASE_URL}/api/summary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, max_length: maxLength }),
  });
  const data = await handleResponse(res);
  return data.summary;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

/**
 * Ask the document a question using RAG.
 *
 * @param {string} message   - The user's question
 * @param {string} documentId - The document_id returned by uploadPDF()
 * @param {number} [topK=5]  - Number of chunks to retrieve for context
 * @returns {Promise<{ answer: string, source_chunks: string[] }>}
 */
export async function sendMessage(message, documentId, topK = 5) {
  const res = await fetch(`${BASE_URL}/api/chat/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_id: documentId,
      question: message,
      top_k: topK,
    }),
  });
  const data = await handleResponse(res);
  return { answer: data.answer, source_chunks: data.source_chunks ?? [] };
}

// ── Health ────────────────────────────────────────────────────────────────────

/**
 * Check if the backend is reachable.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
