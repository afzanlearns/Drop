import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash, FileText, Code, Image, FilePdf, File, PushPin, PushPinSlash, Icon, Tag, Plus, X } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";
import { ContentType } from "../../../../shared/types";
import { useRoomStore } from "../../store/roomStore";
import { useCreator } from "../../hooks/useCreator";
import { useGuestName } from "../../hooks/useGuestName";
import TextBlock from "./TextBlock";
import CodeBlock from "./CodeBlock";
import ImageBlock from "./ImageBlock";
import PDFBlock from "./PDFBlock";
import FileBlob from "./FileBlob";
import ExpiryBadge from "./ExpiryBadge";

interface Props {
  item: ContentItem;
}

const TYPE_CONFIG: Record<ContentType, { icon: Icon; label: string; bg: string; color: string }> = {
  [ContentType.TEXT]:      { icon: FileText, label: "Text",  bg: "var(--color-surface-alt)",          color: "var(--color-text-secondary)" },
  [ContentType.CODE]:      { icon: Code,     label: "Code",  bg: "rgba(0,113,227,0.08)",               color: "var(--color-accent-blue)"    },
  [ContentType.IMAGE]:     { icon: Image,    label: "Image", bg: "rgba(217,119,6,0.08)",               color: "var(--color-accent-amber)"   },
  [ContentType.PDF]:       { icon: FilePdf,  label: "PDF",   bg: "rgba(220,38,38,0.08)",               color: "var(--color-accent-red)"     },
  [ContentType.FILE_BLOB]: { icon: File,     label: "File",  bg: "var(--color-brand-soft)",            color: "var(--color-brand)"          },
};

export default function ContentItemCard({ item }: Props) {
  const { deleteContent, pinContent, updateTags, room, viewMode } = useRoomStore();
  const { isCreator } = useCreator(room?.code);
  const [guestName]     = useGuestName();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isAddingTag,   setIsAddingTag]   = useState(false);
  const [newTag,        setNewTag]        = useState("");

  const isCompact = viewMode === "compact" || viewMode === "board";
  const config    = TYPE_CONFIG[item.type];
  const Icon      = config.icon;
  const timeAgo   = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  const getUploaderLabel = () => {
    if (!item.uploaderName) return "Anonymous";
    const isMe = guestName && item.uploaderName === guestName;
    if (isMe && isCreator) return "You (Creator)";
    if (isMe) return "You";
    return item.uploaderName;
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await deleteContent(item.id);
  };

  const handlePin = async () => await pinContent(item.id, !item.isPinned);

  const handleAddTag = async () => {
    const normalized = newTag.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized) {
      const currentTags = item.tags ?? [];
      if (!currentTags.includes(normalized)) await updateTags(item.id, [...currentTags, normalized]);
    }
    setNewTag(""); setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    await updateTags(item.id, (item.tags ?? []).filter((t) => t !== tagToRemove));
  };

  return (
    <div
      className="overflow-hidden group/card transition-all duration-150"
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${item.isPinned ? "var(--color-brand)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-md)",
        marginBottom: isCompact ? 0 : "0.75rem",
      }}
    >
      <div className="flex items-center justify-between px-3.5 py-2"
        style={{ borderBottom: "1px solid var(--color-border-soft)" }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: config.bg, color: config.color }}
          >
            <Icon size={10} weight="bold" />
            {config.label}
          </span>

          {item.title && (
            <span className="text-[0.85rem] font-semibold truncate max-w-[200px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              {item.title}
            </span>
          )}

          {!isCompact && item.itemExpiresAt && <ExpiryBadge expiresAt={item.itemExpiresAt} />}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {!isCompact && (
            <div className="flex flex-col items-end gap-0.5 mr-1.5">
              <span className="text-[0.65rem]" style={{ color: "var(--color-text-muted)" }}>{timeAgo}</span>
              <span className="text-[0.65rem] font-semibold px-1 py-0.5 rounded-[3px]"
                style={{ background: "var(--color-surface-alt)", color: "var(--color-text-secondary)" }}
              >
                {getUploaderLabel()}
              </span>
            </div>
          )}

          <div className={`flex items-center gap-0.5 ${isCompact ? "opacity-0 group-hover/card:opacity-100 transition-opacity" : ""}`}>
            {isCreator && (
              <button
                onClick={handlePin}
                title={item.isPinned ? "Unpin" : "Pin to top"}
                className="w-6 h-6 rounded-[4px] flex items-center justify-center transition-all duration-100"
                style={{
                  background: item.isPinned ? "var(--color-brand-soft)" : "transparent",
                  color: item.isPinned ? "var(--color-brand)" : "var(--color-text-muted)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--color-brand-soft)";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-brand)";
                }}
                onMouseLeave={(e) => {
                  if (!item.isPinned) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                  }
                }}
              >
                {item.isPinned ? <PushPin size={12} weight="fill" /> : <PushPinSlash size={12} weight="bold" />}
              </button>
            )}

            {isCreator && (
              <button
                onClick={handleDelete}
                title={confirmDelete ? "Click again to confirm" : "Delete"}
                className="w-6 h-6 rounded-[4px] flex items-center justify-center transition-all duration-100"
                style={{
                  background: confirmDelete ? "rgba(220,38,38,0.08)" : "transparent",
                  color: confirmDelete ? "var(--color-accent-red)" : "var(--color-text-muted)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "var(--color-accent-red)";
                }}
                onMouseLeave={(e) => {
                  if (!confirmDelete) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                  }
                }}
              >
                <Trash size={12} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="sm:hidden flex items-center gap-2 px-3.5 pt-1.5 text-[0.65rem]"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>{getUploaderLabel()}</span>
        <span>\u00B7</span>
        <span>{timeAgo}</span>
      </div>

      <div className={isCompact ? "p-3" : "p-3.5"}>
        {item.type === ContentType.TEXT      && <TextBlock  item={item} />}
        {item.type === ContentType.CODE      && <CodeBlock  item={item} />}
        {item.type === ContentType.IMAGE     && <ImageBlock item={item} />}
        {item.type === ContentType.PDF       && <PDFBlock   item={item} />}
        {item.type === ContentType.FILE_BLOB && <FileBlob   item={item} />}
      </div>

      {isCompact && (
        <div className="px-3 pb-2 flex items-center justify-between text-[0.6rem]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span>{getUploaderLabel()} \u00B7 {timeAgo}</span>
          {item.itemExpiresAt && <ExpiryBadge expiresAt={item.itemExpiresAt} />}
        </div>
      )}

      <div className="px-3.5 pb-3 flex flex-wrap gap-1.5 items-center"
        style={{ background: "var(--color-surface)" }}
      >
        <Tag size={12} style={{ color: "var(--color-text-muted)" }} weight="bold" />

        {item.tags?.map((tag) => (
          <span key={tag}
            className="group/tag inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold transition-colors"
            style={{ background: "var(--color-surface-alt)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
          >
            #{tag}
            <button onClick={() => handleRemoveTag(tag)}
              className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
              style={{ color: "var(--color-text-muted)" }}
            >
              <X size={9} weight="bold" />
            </button>
          </span>
        ))}

        {isAddingTag ? (
          <input
            autoFocus
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")  handleAddTag();
              if (e.key === "Escape") setIsAddingTag(false);
            }}
            onBlur={handleAddTag}
            placeholder="Tag\u2026"
            className="text-[0.68rem] px-1.5 py-0.5 rounded-full outline-none w-16"
            style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-brand)", color: "var(--color-text-primary)" }}
          />
        ) : (
          <button
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold transition-all duration-100"
            style={{ color: "var(--color-text-muted)", border: "1px dashed var(--color-border)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-brand)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
            }}
          >
            <Plus size={9} weight="bold" /> Tag
          </button>
        )}
      </div>
    </div>
  );
}
