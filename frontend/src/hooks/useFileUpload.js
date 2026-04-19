import { useState, useCallback } from 'react';
import { uploadPDF } from '../services/api';

/**
 * useFileUpload — manages PDF file selection, real upload to FastAPI,
 * progress tracking, and the document_id returned by the backend.
 *
 * Returns:
 *   files          — all uploaded File objects in this session
 *   activeFile     — currently selected File | null
 *   documentId     — the backend document_id for the active file (null until uploaded)
 *   uploadProgress — 0-100
 *   isUploading    — bool
 *   isUploaded     — bool
 *   uploadError    — string | null  (shown to user on failure)
 *   handleFileSelect(file)
 *   setActiveFile(file)
 *   removeFile(file)
 */
export function useFileUpload() {
  const [files, setFiles] = useState([]);           // all uploaded files
  const [activeFile, setActiveFileState] = useState(null);
  const [documentId, setDocumentId] = useState(null); // backend document_id
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // File-to-documentId mapping so switching between files restores the id
  const [fileDocMap, setFileDocMap] = useState({});

  const handleFileSelect = useCallback(async (file) => {
    // Deselect / clear
    if (!file) {
      setActiveFileState(null);
      setDocumentId(null);
      setIsUploaded(false);
      setUploadProgress(0);
      setUploadError(null);
      return;
    }

    setActiveFileState(file);
    setIsUploaded(false);
    setUploadError(null);

    // If we've already uploaded this file before, reuse its documentId
    if (fileDocMap[file.name]) {
      setDocumentId(fileDocMap[file.name]);
      setIsUploaded(true);
      setUploadProgress(100);
      return;
    }

    // ── Real upload to FastAPI ────────────────────────────────────────────────
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadPDF(file, (pct) => setUploadProgress(pct));
      // result = { document_id, filename, chunk_count, message }
      const docId = result.document_id;

      setDocumentId(docId);
      setFileDocMap((prev) => ({ ...prev, [file.name]: docId }));
      setIsUploaded(true);
      setUploadProgress(100);

      setFiles((prev) => {
        if (prev.find((f) => f.name === file.name)) return prev;
        return [...prev, file];
      });
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
      setIsUploaded(false);
    } finally {
      setIsUploading(false);
    }
  }, [fileDocMap]);

  // Switch active file and restore its document_id
  const setActiveFile = useCallback((file) => {
    setActiveFileState(file);
    const cachedId = fileDocMap[file?.name];
    setDocumentId(cachedId || null);
    setIsUploaded(!!cachedId);
    setUploadProgress(cachedId ? 100 : 0);
    setUploadError(null);
  }, [fileDocMap]);

  const removeFile = useCallback((file) => {
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
    setFileDocMap((prev) => {
      const next = { ...prev };
      delete next[file.name];
      return next;
    });
    if (activeFile?.name === file.name) {
      setActiveFileState(null);
      setDocumentId(null);
      setIsUploaded(false);
      setUploadProgress(0);
    }
  }, [activeFile]);

  return {
    files,
    activeFile,
    documentId,
    uploadProgress,
    isUploading,
    isUploaded,
    uploadError,
    handleFileSelect,
    setActiveFile,
    removeFile,
  };
}
