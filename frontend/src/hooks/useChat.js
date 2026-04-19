import { useState, useCallback } from 'react';
import { sendMessage as apiSendMessage } from '../services/api';

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * useChat — manages chat messages and calls the real RAG backend.
 *
 * @param {string | null} documentId — the backend document_id for the active file.
 *   Must be non-null before sendMessage() is called.
 *
 * Returns:
 *   messages     — array of { id, role, content, time, sourceChunks? }
 *   isTyping     — bool
 *   chatError    — string | null
 *   sendMessage(text) — async, appends user + AI messages
 *   clearChat()
 */
export function useChat(documentId = null) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Optimistically add the user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content,
      time: timestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setChatError(null);

    // Guard: no document uploaded yet
    if (!documentId) {
      const warnMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Please upload a PDF first so I can answer questions about it.',
        time: timestamp(),
      };
      setMessages((prev) => [...prev, warnMsg]);
      setIsTyping(false);
      return;
    }

    try {
      const { answer, source_chunks } = await apiSendMessage(content, documentId);
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: answer,
        time: timestamp(),
        sourceChunks: source_chunks,  // available for future "Show sources" UI
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errText = err.message || 'Something went wrong. Please try again.';
      setChatError(errText);
      const errMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ ${errText}`,
        time: timestamp(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [documentId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatError(null);
  }, []);

  return { messages, isTyping, chatError, sendMessage, clearChat };
}
