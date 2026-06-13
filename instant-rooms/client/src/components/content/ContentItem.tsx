import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
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

function TextTypeIcon() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="1.5" rx="0.3" fill="currentColor"/><rect x="1" y="4" width="6" height="1" rx="0.3" fill="currentColor"/><rect x="1" y="6.5" width="7" height="1" rx="0.3" fill="currentColor"/></svg>; }
function CodeTypeIcon() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 2.5L1 5L3 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 2.5L9 5L7 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 1.5L4.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function ImageTypeIcon() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1.5" width="8" height="7" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><circle cx="3" cy="4" r="1" fill="currentColor"/><path d="M1 7.5L3.5 5L6 7.5L7.5 6L9 7.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function PdfTypeIcon() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="2" y="1" width="6" height="8" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><path d="M3 3.5H7M3 5.5H6M3 7.5H7" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/></svg>; }
function FileTypeIcon() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 1H6L8 3V8.5C8 9.0523 7.55228 9.5 7 9.5H2.5C1.94772 9.5 1.5 9.05228 1.5 8.5V2C1.5 1.44772 1.94772 1 2.5 1Z" stroke="currentColor" strokeWidth="0.8"/><path d="M5.5 1V3.5H8" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round"/></svg>; }

const TYPE_CONFIG: Record<ContentType, { label: string; color: string; icon: () => JSX.Element }> = {
  [ContentType.TEXT]:      { label: "Text",  color: "var(--text-secondary)", icon: TextTypeIcon },
  [ContentType.CODE]:      { label: "Code",  color: "var(--info)",           icon: CodeTypeIcon },
  [ContentType.IMAGE]:     { label: "Image", color: "var(--warning)",        icon: ImageTypeIcon },
  [ContentType.PDF]:       { label: "PDF",   color: "var(--error)",          icon: PdfTypeIcon },
  [ContentType.FILE_BLOB]: { label: "File",  color: "var(--text-secondary)", icon: FileTypeIcon },
};

export default function ContentItemCard({ item }: Props) {
  const { deleteContent, pinContent, updateTags, room, viewMode } = useRoomStore();
  const { isCreator } = useCreator(room?.code);
  const [guestName] = useGuestName();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const isCompact = viewMode === "compact" || viewMode === "board";
  const config = TYPE_CONFIG[item.type];
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

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
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid ' + (item.isPinned ? 'var(--accent)' : 'var(--border-subtle)'),
      marginBottom: isCompact ? 0 : '0.75rem',
    }}>
      <div className="flex items-center justify-between px-3.5 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-mono text-label" style={{ color: config.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {config.icon()} {config.label}
          </span>
          {item.title && (
            <span className="font-mono text-xs font-medium truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
              {item.title}
            </span>
          )}
          {!isCompact && item.itemExpiresAt && <ExpiryBadge expiresAt={item.itemExpiresAt} />}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {!isCompact && (
            <div className="flex items-center gap-2 mr-2">
              <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>{timeAgo}</span>
              <span className="font-mono text-data" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', padding: '1px 4px' }}>
                {getUploaderLabel()}
              </span>
            </div>
          )}
          <div className={`flex items-center gap-0.5 ${isCompact ? "opacity-0 group-hover/card:opacity-100 transition-opacity" : ""}`}>
            {isCreator && (
              <button onClick={handlePin}
                className="font-mono text-label px-1.5 py-0.5"
                style={{ color: item.isPinned ? 'var(--accent)' : 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={(e) => { if (!item.isPinned) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {item.isPinned ? "PINNED" : "PIN"}
              </button>
            )}
            {isCreator && (
              <button onClick={handleDelete}
                className="font-mono text-label px-1.5 py-0.5"
                style={{ color: confirmDelete ? 'var(--error)' : 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                onMouseLeave={(e) => { if (!confirmDelete) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {confirmDelete ? "CONFIRM?" : "DELETE"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={isCompact ? "p-3" : "p-3.5"}>
        {item.type === ContentType.TEXT      && <TextBlock  item={item} />}
        {item.type === ContentType.CODE      && <CodeBlock  item={item} />}
        {item.type === ContentType.IMAGE     && <ImageBlock item={item} />}
        {item.type === ContentType.PDF       && <PDFBlock   item={item} />}
        {item.type === ContentType.FILE_BLOB && <FileBlob   item={item} />}
        {item.note && (
          <p className="font-mono text-xs mt-3 italic" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            {item.note}
          </p>
        )}
      </div>

      {isCompact && (
        <div className="px-3 pb-2 flex items-center justify-between font-mono text-data" style={{ color: 'var(--text-muted)' }}>
          <span>{getUploaderLabel()} / {timeAgo}</span>
          {item.itemExpiresAt && <ExpiryBadge expiresAt={item.itemExpiresAt} />}
        </div>
      )}

      <div className="px-3.5 pb-3 flex flex-wrap gap-1.5 items-center">
        {item.tags?.map((tag) => (
          <span key={tag} className="group/tag inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-label"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            #{tag}
            <button onClick={() => handleRemoveTag(tag)} style={{ color: 'var(--text-muted)' }}>×</button>
          </span>
        ))}
        {isAddingTag ? (
          <input
            autoFocus
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); if (e.key === "Escape") setIsAddingTag(false); }}
            onBlur={handleAddTag}
            placeholder="Tag..."
            className="font-mono text-xs px-1.5 py-0.5 outline-none w-16"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
          />
        ) : (
          <button onClick={() => setIsAddingTag(true)}
            className="font-mono text-label px-1.5 py-0.5"
            style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-default)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            + Tag
          </button>
        )}
      </div>
    </div>
  );
}
