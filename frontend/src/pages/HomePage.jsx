import { useState } from 'react';
import { MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import ChatInput from '../components/ChatInput';
import { useFileUpload } from '../hooks/useFileUpload';
import { useChat } from '../hooks/useChat';
import { getSummary } from '../services/api';

export default function HomePage() {
  const {
    files,
    activeFile,
    documentId,          // ← real backend document_id
    uploadProgress,
    isUploading,
    isUploaded,
    uploadError,         // ← show to user if upload fails
    handleFileSelect,
    setActiveFile,
    removeFile,
  } = useFileUpload();

  // Pass documentId into useChat so every message is grounded in the right doc
  const { messages, isTyping, chatError, sendMessage, clearChat } = useChat(documentId);

  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const handleGenerateSummary = async () => {
    if (!documentId) return;
    setSummaryLoading(true);
    setSummary('');
    setSummaryError(null);
    try {
      const result = await getSummary(documentId);
      setSummary(result);
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Workspace</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a PDF, generate an AI summary, and chat with your document.
        </p>
      </div>

      {/* Upload error banner */}
      {uploadError && (
        <div className="mb-4 flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span><strong>Upload failed:</strong> {uploadError}</span>
        </div>
      )}

      {/* 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Sidebar ── */}
        <Sidebar
          files={files}
          activeFile={activeFile}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          isUploaded={isUploaded}
          summary={summary}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
          onFileSelect={handleFileSelect}
          onSetActive={setActiveFile}
          onRemoveFile={removeFile}
          onGenerateSummary={handleGenerateSummary}
        />

        {/* ── RIGHT: Chat Panel ── */}
        <section
          className="flex-1 glass-card flex flex-col overflow-hidden"
          style={{ minHeight: '560px' }}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-violet-600 rounded-lg flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-slate-800">Chat with Document</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Active file badge */}
              {activeFile && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {activeFile.name.length > 24
                    ? activeFile.name.slice(0, 24) + '…'
                    : activeFile.name}
                </span>
              )}
              {/* Clear chat button */}
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                  title="Clear chat"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <ChatContainer
            messages={messages}
            isTyping={isTyping}
            hasFile={isUploaded}
          />

          {/* Input — disabled until a document is uploaded and indexed */}
          <ChatInput
            onSend={sendMessage}
            disabled={!isUploaded || isUploading}
            placeholder={
              !isUploaded
                ? 'Upload a PDF to start chatting…'
                : 'Ask anything about your document…'
            }
          />
        </section>
      </div>
    </div>
  );
}
