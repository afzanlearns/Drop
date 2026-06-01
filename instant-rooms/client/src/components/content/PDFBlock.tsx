import { useState } from "react";
import { Document, Page } from "react-pdf";
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  DownloadSimple,
  Warning,
} from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function PDFBlock({ item }: Props) {
  const [numPages,    setNumPages]    = useState<number>(0);
  const [pageNumber,  setPageNumber]  = useState(1);
  const [scale,       setScale]       = useState(1.0);
  const [error,       setError]       = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
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

  const changePage  = (delta: number) =>
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

  /* ── Error state ── */
  if (error) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl"
        style={{
          background: "rgba(220,38,38,0.06)",
          border:     "1px solid rgba(220,38,38,0.20)",
        }}
      >
        <Warning size={22} weight="bold" style={{ color: "var(--color-accent-amber)", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-[0.875rem] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
            {filename}
          </p>
          <p className="text-[0.75rem] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            Could not render PDF preview
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary text-[0.8rem] py-2 px-3 disabled:opacity-50 flex-shrink-0"
        >
          <DownloadSimple size={15} weight="bold" /> Download
        </button>
      </div>
    );
  }

  /* ── Viewer ── */
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        border:       "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        boxShadow:    "var(--shadow-sm)",
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-2.5"
        style={{
          background:   "var(--color-graphite, #1A1817)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Page nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <CaretLeft size={14} weight="bold" />
          </button>
          <span
            className="text-[0.72rem] font-mono font-semibold min-w-[56px] text-center"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {isLoading ? "…" : `${pageNumber} / ${numPages}`}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <CaretRight size={14} weight="bold" />
          </button>
        </div>

        {/* Filename */}
        <span
          className="text-[0.68rem] font-mono truncate max-w-[130px]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {filename}
        </span>

        {/* Zoom + Download */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeScale(-0.2)}
            disabled={scale <= 0.5}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <MagnifyingGlassMinus size={14} weight="bold" />
          </button>
          <span
            className="text-[0.68rem] font-mono w-10 text-center"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => changeScale(0.2)}
            disabled={scale >= 2.5}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <MagnifyingGlassPlus size={14} weight="bold" />
          </button>

          <div
            className="w-px h-4 mx-1"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />

          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download PDF"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <DownloadSimple size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div
        className="overflow-auto flex justify-center p-6 max-h-[600px]"
        style={{ background: "var(--color-surface-alt)" }}
      >
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div
              className="w-8 h-8 rounded-full border-[3px] animate-spin"
              style={{
                borderColor:    "var(--color-border)",
                borderTopColor: "var(--color-brand)",
              }}
            />
          </div>
        )}
        <Document
          file={item.fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className={isLoading ? "hidden" : ""}
          loading=""
        >
          <div style={{ boxShadow: "var(--shadow-md)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
