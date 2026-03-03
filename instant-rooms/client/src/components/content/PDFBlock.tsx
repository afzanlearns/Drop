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

interface Props {
  item: ContentItem;
}

export default function PDFBlock({ item }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const filename = item.metadata.filename ?? item.title ?? "document.pdf";

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError() {
    setError(true);
    setIsLoading(false);
  }

  const changePage = (delta: number) => {
    setPageNumber((p) => Math.max(1, Math.min(numPages, p + delta)));
  };

  const changeScale = (delta: number) => {
    setScale((s) => Math.max(0.5, Math.min(2.5, parseFloat((s + delta).toFixed(1)))));
  };

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
        <Warning size={18} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-700">{filename}</p>
          <p className="text-xs text-red-400 mt-0.5">Could not render PDF preview</p>
        </div>
        <a
          href={item.fileUrl ?? ""}
          download={filename}
          className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <DownloadSimple size={13} />
          Download
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* PDF Toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-zinc-950 rounded-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
          >
            <CaretLeft size={14} />
          </button>
          <span className="text-xs text-zinc-400 font-mono min-w-[60px] text-center">
            {isLoading ? "..." : `${pageNumber} / ${numPages}`}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
          >
            <CaretRight size={14} />
          </button>
        </div>

        <span className="text-xs text-zinc-500 truncate font-mono max-w-[120px]">{filename}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => changeScale(-0.2)}
            disabled={scale <= 0.5}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors rounded"
          >
            <MagnifyingGlassMinus size={14} />
          </button>
          <span className="text-xs text-zinc-500 font-mono w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => changeScale(0.2)}
            disabled={scale >= 2.5}
            className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors rounded"
          >
            <MagnifyingGlassPlus size={14} />
          </button>

          <div className="w-px h-4 bg-zinc-800 mx-1" />

          <a
            href={item.fileUrl ?? ""}
            download={filename}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded"
          >
            <DownloadSimple size={14} />
          </a>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="overflow-auto bg-zinc-100 rounded-xl flex justify-center p-4 max-h-[600px]">
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
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
            className="shadow-diffuse"
          />
        </Document>
      </div>
    </div>
  );
}
