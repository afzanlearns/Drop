import { DownloadSimple, File } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";

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

  return (
    <a
      href={item.fileUrl ?? ""}
      download={filename}
      className="group flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 hover:border-zinc-200 rounded-xl transition-all"
    >
      <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <File size={18} className="text-zinc-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-700 truncate group-hover:text-zinc-900 transition-colors">
          {filename}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {size && <span className="text-xs text-zinc-400 font-mono">{size}</span>}
          {mime && (
            <span className="text-xs text-zinc-300 font-mono truncate max-w-[120px]">{mime}</span>
          )}
        </div>
      </div>

      <div className="p-2 text-zinc-400 group-hover:text-zinc-600 transition-colors flex-shrink-0">
        <DownloadSimple size={16} />
      </div>
    </a>
  );
}
