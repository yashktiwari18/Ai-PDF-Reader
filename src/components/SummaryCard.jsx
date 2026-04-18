import { useState } from 'react';
import { Sparkles, Loader2, FileSearch, ChevronDown, ChevronUp } from 'lucide-react';

export default function SummaryCard({ summary, isLoading, onGenerate, hasFile, error }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="glass-card overflow-hidden transition-shadow duration-300 hover:shadow-lifted">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-brand-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">AI Summary</h3>
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-5 space-y-4 animate-slide-up">
          {/* Summary text area */}
          <div
            className={`min-h-[120px] max-h-52 scrollbar-thin overflow-y-auto rounded-xl p-4 text-sm leading-relaxed transition-all duration-300 ${
              summary
                ? 'bg-slate-50 text-slate-700'
                : 'flex flex-col items-center justify-center text-center gap-2'
            }`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 size={28} className="text-brand-500 animate-spin" />
                <p className="text-sm text-slate-500 animate-pulse-soft">Analyzing document…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <p className="text-xs font-semibold text-red-500">⚠️ {error}</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Make sure the PDF was uploaded successfully and the backend is running.
                  If you refreshed the page, please re-upload your PDF.
                </p>
              </div>
            ) : summary ? (
              <p>{summary}</p>
            ) : (
              <>
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <FileSearch size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-400 text-xs max-w-xs">
                  {hasFile
                    ? 'Click "Generate Summary" to analyze your document.'
                    : 'Upload a PDF to generate an AI summary.'}
                </p>
              </>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={onGenerate}
            disabled={!hasFile || isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl
              bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm
              hover:from-brand-600 hover:to-brand-700 hover:shadow-md
              disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
              transition-all duration-200"
          >
            {isLoading ? (
              <><Loader2 size={15} className="animate-spin" /> Generating…</>
            ) : (
              <><Sparkles size={15} /> Generate Summary</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
