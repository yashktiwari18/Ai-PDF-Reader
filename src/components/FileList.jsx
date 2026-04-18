import { FileText, Trash2 } from 'lucide-react';

export default function FileList({ files, activeFile, onSelect, onRemove }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-1.5 animate-fade-in">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
        Uploaded Files
      </p>
      {files.map((file, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(file)}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
            activeFile?.name === file.name
              ? 'bg-brand-50 border border-brand-200 shadow-sm'
              : 'hover:bg-slate-50 border border-transparent'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            activeFile?.name === file.name ? 'bg-brand-100' : 'bg-slate-100'
          }`}>
            <FileText size={15} className={activeFile?.name === file.name ? 'text-brand-600' : 'text-slate-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              activeFile?.name === file.name ? 'text-brand-700' : 'text-slate-700'
            }`}>
              {file.name}
            </p>
            <p className="text-xs text-slate-400">
              {(file.size / 1024).toFixed(1)} KB · PDF
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(file); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
            aria-label="Remove file"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
