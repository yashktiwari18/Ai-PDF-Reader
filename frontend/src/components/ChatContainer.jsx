import { useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import ChatMessage from './ChatMessage';
import Loader from './Loader';

/**
 * Typing indicator — three bouncing dots.
 */
function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-brand-600 flex items-center justify-center shrink-0 shadow-sm">
        <Brain size={15} className="text-white" />
      </div>
      <div className="px-4 py-3 bg-white border border-surface-border rounded-2xl rounded-tl-sm shadow-card">
        <div className="flex gap-1 items-center h-4">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * EmptyState — shown when no messages exist yet.
 */
function EmptyState({ hasFile }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
      <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-violet-100 rounded-2xl flex items-center justify-center">
        <Brain size={28} className="text-brand-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">Ask me anything about your document</p>
        <p className="text-xs text-slate-400 mt-1">
          {hasFile
            ? 'Your PDF is ready — start chatting!'
            : 'Upload a PDF from the left panel to get started.'}
        </p>
      </div>
      {!hasFile && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {['Summarize this document', 'List key points', 'What are the main topics?'].map((hint) => (
            <span
              key={hint}
              className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-full"
            >
              {hint}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ChatContainer — scrollable message list.
 *
 * Props:
 *  messages  — array of { id, role, content, time }
 *  isTyping  — bool (show typing indicator)
 *  hasFile   — bool (controls empty-state copy)
 *  isLoading — bool (show centered spinner while document loads)
 */
export default function ChatContainer({ messages, isTyping, hasFile, isLoading = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-4 min-h-0">
      {isLoading ? (
        <Loader full size="md" label="Loading document…" />
      ) : messages.length === 0 ? (
        <EmptyState hasFile={hasFile} />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
