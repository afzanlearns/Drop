import { useState } from "react";
import { Document, Page } from "react-pdf";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function PDFBlock({ item }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const filename = item.metadata.filename ?? item.title ?? "document.pdf";

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = () => {
    setError(true);
    setIsLoading(false);
  };

  const changePage = (delta: number) =>
    setPageNumber((p) => Math.max(1, Math.min(numPages, p + delta)));

  const changeScale = (delta: number) =>
    setScale((s) => Math.max(0.5, Math.min(2.5, parseFloat((s + delta).toFixed(1)))));

  const handleDownload = async () => {
    if (!item.fileUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadFile(item.fileUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-4 p-4"
        style={{ background: 'var(--accent-dim)', border: '1px solid var(--error)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{filename}</p>
          <p className="font-mono text-data mt-0.5" style={{ color: 'var(--text-muted)' }}>Could not render PDF preview</p>
        </div>
        <button onClick={handleDownload} disabled={downloading} className="btn-primary" style={{ minHeight: 32, padding: '0.25rem 0.75rem' }}>
          Download
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      <div className="flex items-center justify-between gap-3 px-4 py-2"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-1">
          <button onClick={() => changePage(-1)} disabled={pageNumber <= 1}
            className="font-mono text-label px-2 py-1"
            style={{ color: pageNumber <= 1 ? 'var(--text-muted)' : 'var(--text-secondary)' }}
          >
            ◀
          </button>
          <span className="font-mono text-data min-w-[48px] text-center" style={{ color: 'var(--text-secondary)' }}>
            {isLoading ? "..." : `${pageNumber} / ${numPages}`}
          </span>
          <button onClick={() => changePage(1)} disabled={pageNumber >= numPages}
            className="font-mono text-label px-2 py-1"
            style={{ color: pageNumber >= numPages ? 'var(--text-muted)' : 'var(--text-secondary)' }}
          >
            ▶
          </button>
        </div>

        <span className="font-mono text-data truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>
          {filename}
        </span>

        <div className="flex items-center gap-1">
          <button onClick={() => changeScale(-0.2)} disabled={scale <= 0.5}
            className="font-mono text-label px-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            −
          </button>
          <span className="font-mono text-data w-8 text-center" style={{ color: 'var(--text-muted)' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => changeScale(0.2)} disabled={scale >= 2.5}
            className="font-mono text-label px-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            +
          </button>
          <span className="w-px h-3 mx-1" style={{ background: 'var(--border-subtle)' }} />
          <button onClick={handleDownload} disabled={downloading}
            className="font-mono text-label"
            style={{ color: 'var(--text-secondary)' }}
          >
            {downloading ? "..." : "Download"}
          </button>
        </div>
      </div>

      <div className="overflow-auto flex justify-center p-4 max-h-[600px]" style={{ background: 'var(--bg-elevated)' }}>
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>Loading PDF...</span>
          </div>
        )}
        <Document
          file={item.fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className={isLoading ? "hidden" : ""}
          loading=""
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
}
