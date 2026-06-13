import { useState, useMemo } from "react";
import type { ContentItem } from "../../../../shared/types";
import ContentItemCard from "../content/ContentItem";
import { useRoomStore } from "../../store/roomStore";
import BoardView from "./BoardView";

interface TimelineProps {
  items: ContentItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const { viewMode } = useRoomStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach((item) => item.tags?.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedTags.length === 0) return items;
    return items.filter((item) => selectedTags.every((tag) => item.tags?.includes(tag)));
  }, [items, selectedTags]);

  const pinned  = filteredItems.filter((i) => i.isPinned);
  const regular = filteredItems.filter((i) => !i.isPinned);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="font-mono font-medium" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            No content yet
          </p>
          <p className="font-mono text-xs max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>
            Drop files, paste text, or add code blocks using the panel on the left.
          </p>
          <div className="flex gap-2 mt-2">
            {[
              { label: "Drop a file", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5V8M6 8L3.5 5.5M6 8L8.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 8V10C1.5 10.5523 1.94772 11 2.5 11H9.5C10.0523 11 10.5 10.5523 10.5 10V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
              { label: "Text", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="1.5" rx="0.3" fill="currentColor"/><rect x="1.5" y="4.5" width="7" height="1" rx="0.3" fill="currentColor"/><rect x="1.5" y="7.5" width="8" height="1" rx="0.3" fill="currentColor"/></svg> },
              { label: "Code", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 3L1.5 6L4 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 3L10.5 6L8 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 1.5L5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
            ].map(({ label, icon }) => (
              <span key={label} className="font-mono text-label px-3 py-2 inline-flex items-center gap-1.5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "board") return <BoardView items={filteredItems} />;

  return (
    <div className={`px-6 md:px-8 py-6 flex flex-col gap-5 mx-auto w-full transition-all duration-150 ${
      viewMode === "compact" ? "max-w-5xl" : "max-w-3xl"
    }`}>
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>Timeline</span>
        <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          {selectedTags.length > 0 && ` (filtered from ${items.length})`}
        </span>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className="font-mono text-label px-3 py-1.5"
              style={{
                background: selectedTags.includes(tag) ? 'var(--accent)' : 'var(--bg-surface)',
                color: selectedTags.includes(tag) ? 'var(--bg-base)' : 'var(--text-secondary)',
                border: '1px solid ' + (selectedTags.includes(tag) ? 'var(--accent)' : 'var(--border-default)'),
              }}
            >
              #{tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])}
              className="font-mono text-label px-3 py-1.5"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {filteredItems.length === 0 && selectedTags.length > 0 && (
        <div className="py-12 text-center">
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            No items match the selected tags.
          </p>
        </div>
      )}

      {pinned.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-label px-3 py-1" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
              Pinned
            </span>
            <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
          </div>
          {pinned.map((item) => <ContentItemCard key={item.id} item={item} />)}
        </div>
      )}

      {pinned.length > 0 && regular.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>Recent</span>
          <div className="flex-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
        </div>
      )}

      {regular.map((item) => <ContentItemCard key={item.id} item={item} />)}
    </div>
  );
}
