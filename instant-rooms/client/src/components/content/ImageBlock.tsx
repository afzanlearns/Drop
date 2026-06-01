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
    background:   "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    border:       "1px solid rgba(255,255,255,0.10)",
    borderRadius: "var(--radius-sm)",
    color:        "#fff",
  };

  return (
    <>
      <div
        className="relative group overflow-hidden"
        style={{
          border:       "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)",
          boxShadow:    "var(--shadow-sm)",
        }}
      >
        {/* Skeleton while loading */}
        {!loaded && !error && <div className="skeleton w-full h-48 rounded-none" />}

        {/* Error state */}
        {error ? (
          <div
            className="w-full h-32 flex items-center justify-center"
            style={{
              background: "var(--color-surface-alt)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <p className="text-[0.78rem]" style={{ color: "var(--color-text-muted)" }}>
              Failed to load image
            </p>
          </div>
        ) : (
          <img
            ref={imgRef}
            alt={filename}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full object-cover cursor-zoom-in transition-opacity duration-300 max-h-[400px] ${
              loaded ? "opacity-100" : "opacity-0 absolute"
            }`}
          />
        )}

        {/* Hover action buttons */}
        {loaded && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={() => setLightbox(true)}
              className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-110"
              style={iconBtn}
              title="View full size"
            >
              <ArrowsOut size={15} weight="bold" />
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-8 h-8 flex items-center justify-center transition-transform hover:scale-110 disabled:opacity-50"
              style={iconBtn}
              title="Download image"
            >
              {downloading ? (
                <span
                  className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                />
              ) : (
                <DownloadSimple size={15} weight="bold" />
              )}
            </button>
          </div>
        )}

        {/* Footer meta */}
        {loaded && (
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{
              background:  "var(--color-surface-alt)",
              borderTop:   "1px solid var(--color-border-soft)",
            }}
          >
            <p
              className="text-[0.75rem] font-medium truncate mr-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {filename}
            </p>
            {size && (
              <p
                className="text-[0.7rem] flex-shrink-0"
                style={{ color: "var(--color-text-muted)" }}
              >
                {size}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,255,255,0.10)",
              color:      "#fff",
            }}
            onClick={() => setLightbox(false)}
          >
            <X size={18} weight="bold" />
          </button>
          <img
            src={item.fileUrl ?? ""}
            alt={filename}
            className="max-w-full max-h-full object-contain rounded-xl"
            style={{ boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
