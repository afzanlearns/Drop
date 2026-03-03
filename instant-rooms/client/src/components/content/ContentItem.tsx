import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash, FileText, Code, Image, FilePdf, File } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";
import { ContentType, AccessMode } from "../../../../shared/types";
import { useRoomStore } from "../../store/roomStore";
import TextBlock from "./TextBlock";
import CodeBlock from "./CodeBlock";
import ImageBlock from "./ImageBlock";
import PDFBlock from "./PDFBlock";
import FileBlob from "./FileBlob";

interface Props {
  item: ContentItem;
}

const TYPE_CONFIG: Record<
  ContentType,
  { icon: React.ComponentType<{ size: number; className?: string }>; label: string; color: string }
> = {
  [ContentType.TEXT]: { icon: FileText, label: "Text", color: "text-zinc-500 bg-zinc-100" },
  [ContentType.CODE]: { icon: Code, label: "Code", color: "text-violet-600 bg-violet-50" },
  [ContentType.IMAGE]: { icon: Image, label: "Image", color: "text-amber-600 bg-amber-50" },
  [ContentType.PDF]: { icon: FilePdf, label: "PDF", color: "text-red-600 bg-red-50" },
  [ContentType.FILE_BLOB]: { icon: File, label: "File", color: "text-blue-600 bg-blue-50" },
};

export default function ContentItemCard({ item }: Props) {
  const { deleteContent, room } = useRoomStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const config = TYPE_CONFIG[item.type];
  const IconComponent = config.icon;
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
  const canDelete = room?.accessMode === AccessMode.FULL_ACCESS;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await deleteContent(item.id);
  };

  return (
    <div className="content-card overflow-hidden">
      {/* Item header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-50">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${config.color}`}>
            <IconComponent size={11} />
            {config.label}
            {item.metadata.language && (
              <span className="opacity-60">{item.metadata.language}</span>
            )}
          </span>
          {item.title && (
            <span className="text-xs font-medium text-zinc-600 truncate max-w-[200px]">
              {item.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-zinc-300 hidden sm:block">{timeAgo}</span>
          {canDelete && (
            <button
              onClick={handleDelete}
              className={`p-1 rounded-md transition-all active:scale-[0.95] ${
                confirmDelete
                  ? "text-red-500 bg-red-50 hover:bg-red-100"
                  : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"
              }`}
              title={confirmDelete ? "Click again to confirm" : "Delete item"}
            >
              <Trash size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Item content */}
      <div className="p-4">
        {item.type === ContentType.TEXT && <TextBlock item={item} />}
        {item.type === ContentType.CODE && <CodeBlock item={item} />}
        {item.type === ContentType.IMAGE && <ImageBlock item={item} />}
        {item.type === ContentType.PDF && <PDFBlock item={item} />}
        {item.type === ContentType.FILE_BLOB && <FileBlob item={item} />}
      </div>
    </div>
  );
}
