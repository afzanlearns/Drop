import { useState } from "react";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileBlob({ item }: Props) {
  const filename = item.metadata.filename ?? item.title ?? "file";
  const size = formatSize(item.metadata.size);
  const mime = item.metadata.mimeType ?? "";
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!item.fileUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadFile(item.fileUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={downloading}
      className="group w-full flex items-center gap-3.5 p-3.5"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
      onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
    >
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--accent)' }}>
            <path d="M3.5 1.5H8.5L11.5 4.5V11C11.5 11.5523 11.0523 12 10.5 12H3.5C2.94772 12 2.5 11.5523 2.5 11V2.5C2.5 1.94772 2.94772 1.5 3.5 1.5Z" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M8 1.5V4.5H11" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
          </svg>
        </div>

      <div className="flex-1 min-w-0 text-left">
        <p className="font-mono text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {filename}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {size && <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>{size}</span>}
          {mime && size && <span style={{ color: 'var(--border-subtle)' }}>/</span>}
          {mime && (
            <span className="font-mono text-data truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>
              {mime}
            </span>
          )}
        </div>
      </div>

      <span className="font-mono text-label flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {downloading ? "..." : "Download"}
      </span>
    </button>
  );
}
