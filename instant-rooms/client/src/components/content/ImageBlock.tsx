import { useState, useRef, useEffect } from "react";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function ImageBlock({ item }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
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
  const size = item.metadata.size ? (item.metadata.size / 1024).toFixed(1) + " KB" : null;

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
    <>
      <div style={{ border: '1px solid var(--border-default)' }}>
        {!loaded && !error && <div className="skeleton w-full h-48" />}

        {error ? (
          <div className="w-full h-32 flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
            <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              Failed to load image
            </p>
          </div>
        ) : (
          <img
            ref={imgRef}
            alt={filename}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full object-cover cursor-zoom-in max-h-[380px] ${loaded ? '' : 'hidden'}`}
            style={{ opacity: loaded ? 1 : 0 }}
          />
        )}

        {loaded && (
          <div className="flex items-center justify-between px-2.5 py-1.5"
            style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="font-mono text-data truncate mr-2" style={{ color: 'var(--text-secondary)' }}>
              {filename}
            </p>
            <div className="flex items-center gap-2">
              {size && <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>{size}</span>}
              <button onClick={() => setLightbox(true)}
                className="font-mono text-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                View
              </button>
              <button onClick={handleDownload} disabled={downloading}
                className="font-mono text-label"
                style={{ color: 'var(--text-secondary)' }}
              >
                {downloading ? "..." : "Download"}
              </button>
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 font-mono text-label" style={{ color: '#fff' }}
            onClick={() => setLightbox(false)}
          >
            Close
          </button>
          <img src={item.fileUrl ?? ""} alt={filename}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
