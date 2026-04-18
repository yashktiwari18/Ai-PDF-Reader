import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';

export default function UploadBox({ onFileSelect, uploadProgress, fileName, isUploading, isUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') onFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 select-none
          ${dragOver
            ? 'border-brand-500 bg-brand-50 scale-[1.01] shadow-glow'
            : isUploaded
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-slate-200 bg-surface-muted hover:border-brand-300 hover:bg-brand-50/50'
          }`}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUploaded ? 'bg-emerald-100' : 'bg-brand-100'} transition-colors duration-300`}>
          {isUploaded
            ? <CheckCircle2 className="text-emerald-600" size={24} />
            : <UploadCloud className={`${dragOver ? 'text-brand-600' : 'text-brand-400'} transition-colors`} size={24} />
          }
        </div>

        {/* Text */}
        {isUploaded ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-700">File uploaded!</p>
            <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
              <FileText size={12} />
              {fileName}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {dragOver ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">or click to browse — PDF files only</p>
          </div>
        )}

        {/* Browse button */}
        {!isUploading && !isUploaded && (
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="mt-1 px-4 py-1.5 text-xs font-medium text-brand-600 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-all duration-200 shadow-sm"
          >
            Upload PDF
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div className="animate-fade-in space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {fileName}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded file chip */}
      {isUploaded && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
          <FileText size={14} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-emerald-700 truncate flex-1">{fileName}</span>
          <button
            onClick={() => onFileSelect(null)}
            className="text-emerald-400 hover:text-emerald-600 transition"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
