import { useState, useRef, useEffect } from "react";
import { ArrowsOut, DownloadSimple } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";

interface Props {
  item: ContentItem;
}

export default function ImageBlock({ item }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && imgRef.current) {
          const img = imgRef.current;
          img.src = item.fileUrl ?? "";
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [item.fileUrl]);

  const filename = item.metadata.filename ?? item.title ?? "image";
  const size = item.metadata.size
    ? (item.metadata.size / 1024).toFixed(1) + " KB"
    : null;

  return (
    <>
      <div className="relative group">
        {/* Skeleton while loading */}
        {!loaded && !error && (
          <div className="skeleton w-full h-48 rounded-xl" />
        )}

        {error ? (
          <div className="w-full h-32 flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-xs text-zinc-400">Failed to load image</p>
          </div>
        ) : (
          <img
            ref={imgRef}
            alt={filename}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full rounded-xl object-cover cursor-zoom-in transition-opacity duration-300 max-h-[400px] ${
              loaded ? "opacity-100" : "opacity-0 absolute"
            }`}
          />
        )}

        {/* Overlay actions */}
        {loaded && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setLightbox(true)}
              className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
            >
              <ArrowsOut size={14} />
            </button>
            <a
              href={item.fileUrl ?? ""}
              download={filename}
              className="p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg hover:bg-black/80 transition-colors"
            >
              <DownloadSimple size={14} />
            </a>
          </div>
        )}

        {loaded && size && (
          <p className="mt-1.5 text-xs text-zinc-300 font-mono">{filename} · {size}</p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <img
            src={item.fileUrl ?? ""}
            alt={filename}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </>
  );
}
