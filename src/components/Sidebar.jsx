import { LayoutPanelLeft } from 'lucide-react';
import UploadBox from './UploadBox';
import FileList from './FileList';
import SummaryCard from './SummaryCard';

/**
 * Sidebar — left panel of the Document Workspace.
 * Composes UploadBox, FileList, and SummaryCard into a single panel.
 *
 * Props:
 *  files           — array of File objects
 *  activeFile      — currently selected File | null
 *  uploadProgress  — number 0-100
 *  isUploading     — bool
 *  isUploaded      — bool
 *  summary         — string | ''
 *  summaryLoading  — bool
 *  onFileSelect    — (File | null) => void
 *  onSetActive     — (File) => void
 *  onRemoveFile    — (File) => void
 *  onGenerateSummary — () => void
 */
export default function Sidebar({
  files,
  activeFile,
  uploadProgress,
  isUploading,
  isUploaded,
  summary,
  summaryLoading,
  summaryError,
  onFileSelect,
  onSetActive,
  onRemoveFile,
  onGenerateSummary,
}) {
  return (
    <aside className="w-full lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col gap-5">
      {/* Upload + File List card */}
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <LayoutPanelLeft size={16} className="text-brand-500" />
          <h2 className="text-sm font-semibold text-slate-800">Upload Document</h2>
        </div>

        <UploadBox
          onFileSelect={onFileSelect}
          uploadProgress={uploadProgress}
          fileName={activeFile?.name}
          isUploading={isUploading}
          isUploaded={isUploaded}
        />

        {files.length > 0 && (
          <FileList
            files={files}
            activeFile={activeFile}
            onSelect={onSetActive}
            onRemove={onRemoveFile}
          />
        )}
      </div>

      {/* AI Summary */}
      <SummaryCard
        summary={summary}
        isLoading={summaryLoading}
        error={summaryError}
        onGenerate={onGenerateSummary}
        hasFile={isUploaded}
      />
    </aside>
  );
}
