import { useRef, useState, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-4 border-t border-surface-border bg-white">
      <div className={`flex items-end gap-2 bg-surface-muted border rounded-2xl px-4 py-2.5 transition-all duration-200 ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'border-slate-200 focus-within:border-brand-400 focus-within:shadow-glow'
      }`}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder ?? (disabled ? 'Upload a PDF to start chatting…' : 'Ask about your document… (Enter to send)')}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none max-h-[120px] scrollbar-thin disabled:cursor-not-allowed"
        />

        {/* Mic button (visual only) */}
        <button
          type="button"
          disabled={disabled}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Voice input"
        >
          <Mic size={16} />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-[10px] text-center text-slate-400 mt-2">
        DocuMind AI · Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
