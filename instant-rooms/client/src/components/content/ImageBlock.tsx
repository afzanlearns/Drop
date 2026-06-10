import { useState, useRef, useEffect } from "react";
import { ArrowsOut, DownloadSimple, X } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function ImageBlock({ item }: Props) {
  const [loaded,      setLoaded]      = useState(false);
  const [error,       setError]       = useState(false);
  const [lightbox,    setLightbox]    = useState(false);
  const [downloading, setDownloading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && imgRef.current) {
          imgRef.current.src = item.fileUrl ?? "";
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [item.fileUrl]);

  const filename = item.metadata.filename ?? item.title ?? "image";
  const size     = item.metadata.size ? (item.metadata.size / 1024).toFixed(1) + " KB" : null;

  const handleDownload = async () => {
    if (!item.fileUrl || downloading) return;
    setDownloading(true);
    try {
      await downloadFile(item.fileUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  const iconBtn: React.CSSProperties = {
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "var(--radius-sm)",
    color: "#fff",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  };

  return (
    <>
      <div className="relative group overflow-hidden"
        style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}
      >
        {!loaded && !error && <div className="skeleton w-full h-48 rounded-none" />}

        {error ? (
          <div className="w-full h-32 flex items-center justify-center"
            style={{ background: "var(--color-surface-alt)", borderBottom: "1px solid var(--color-border)" }}
          >
            <p className="text-[0.75rem]" style={{ color: "var(--color-text-muted)" }}>
              Failed to load image
            </p>
          </div>
        ) : (
          <img
            ref={imgRef}
            alt={filename}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full object-cover cursor-zoom-in transition-opacity duration-300 max-h-[380px] ${
              loaded ? "opacity-100" : "opacity-0 absolute"
            }`}
          />
        )}

        {loaded && (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150">
            <button
              onClick={() => setLightbox(true)}
              style={iconBtn}
              title="View full size"
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.7)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"}
            >
              <ArrowsOut size={13} weight="bold" />
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={iconBtn}
              title="Download image"
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.7)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)"}
            >
              {downloading ? (
                <span className="w-3 h-3 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                />
              ) : (
                <DownloadSimple size={13} weight="bold" />
              )}
            </button>
          </div>
        )}

        {loaded && (
          <div className="flex items-center justify-between px-2.5 py-1.5"
            style={{ background: "var(--color-surface-alt)", borderTop: "1px solid var(--color-border-soft)" }}
          >
            <p className="text-[0.72rem] font-medium truncate mr-2" style={{ color: "var(--color-text-secondary)" }}>
              {filename}
            </p>
            {size && (
              <p className="text-[0.68rem] flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
                {size}
              </p>
            )}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
            onClick={() => setLightbox(false)}
          >
            <X size={16} weight="bold" />
          </button>
          <img
            src={item.fileUrl ?? ""}
            alt={filename}
            className="max-w-full max-h-full object-contain rounded-[8px]"
            style={{ boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
