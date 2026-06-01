import { useState } from "react";
import { DownloadSimple, File } from "@phosphor-icons/react";
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
  const filename    = item.metadata.filename ?? item.title ?? "file";
  const size        = formatSize(item.metadata.size);
  const mime        = item.metadata.mimeType ?? "";
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
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: "var(--color-surface-alt)",
        border:     "1px solid var(--color-border)",
      }}
      onMouseEnter={(e) => {
        if (!downloading) {
          (e.currentTarget as HTMLElement).style.background   = "var(--color-brand-soft)";
          (e.currentTarget as HTMLElement).style.borderColor  = "var(--color-brand)";
          (e.currentTarget as HTMLElement).style.boxShadow    = "var(--shadow-brand)";
          (e.currentTarget as HTMLElement).style.transform    = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background  = "var(--color-surface-alt)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
        (e.currentTarget as HTMLElement).style.boxShadow   = "none";
        (e.currentTarget as HTMLElement).style.transform   = "translateY(0)";
      }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
        style={{
          background: "var(--color-surface)",
          boxShadow:  "var(--shadow-xs)",
        }}
      >
        <File size={22} weight="bold" style={{ color: "var(--color-brand)" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className="text-[0.875rem] font-semibold truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {filename}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {size && (
            <span
              className="text-[0.72rem]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {size}
            </span>
          )}
          {mime && size && (
            <span style={{ color: "var(--color-border)" }}>·</span>
          )}
          {mime && (
            <span
              className="text-[0.72rem] truncate max-w-[140px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {mime}
            </span>
          )}
        </div>
      </div>

      {/* Download icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
        style={{ color: "var(--color-text-muted)" }}
      >
        {downloading ? (
          <span
            className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{
              borderColor:    "var(--color-border)",
              borderTopColor: "var(--color-brand)",
            }}
          />
        ) : (
          <DownloadSimple size={18} weight="bold" />
        )}
      </div>
    </button>
  );
}
