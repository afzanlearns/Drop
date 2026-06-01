import { useState, useMemo } from "react";
import { PushPin, Tray, FileDashed, TextT, Code } from "@phosphor-icons/react";
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

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
            style={{
              background: "var(--color-brand-soft)",
              boxShadow:  "var(--shadow-brand)",
            }}
          >
            <Tray size={36} weight="regular" style={{ color: "var(--color-brand)" }} />
          </div>

          <h3
            className="text-[1.3rem] font-black tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            No content yet
          </h3>

          <p
            className="text-[0.875rem] max-w-[280px] leading-[1.6]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Drop files, paste text, or add code blocks using the panel on the left.
          </p>

          <div className="flex gap-2 mt-2">
            {[
              { icon: FileDashed, label: "Drop a file" },
              { icon: TextT,      label: "Text"        },
              { icon: Code,       label: "Code"        },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-[0.78rem] font-medium px-3 py-2 rounded-lg cursor-default"
                style={{
                  background: "var(--color-surface)",
                  border:     "1px solid var(--color-border)",
                  color:      "var(--color-text-secondary)",
                  boxShadow:  "var(--shadow-xs)",
                }}
              >
                <Icon size={14} weight="bold" style={{ color: "var(--color-brand)" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "board") return <BoardView items={filteredItems} />;

  return (
    <div
      className={`px-8 py-6 flex flex-col gap-5 mx-auto w-full transition-all duration-300 ${
        viewMode === "compact" ? "max-w-5xl" : "max-w-3xl"
      }`}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between pb-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span
          className="text-[1rem] font-black tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Timeline
        </span>
        <span
          className="text-[0.78rem] font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
          {selectedTags.length > 0 && ` (filtered from ${items.length})`}
        </span>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full text-[0.75rem] font-semibold transition-all duration-150"
              style={{
                background:  selectedTags.includes(tag) ? "var(--color-brand)"      : "var(--color-surface)",
                color:       selectedTags.includes(tag) ? "#fff"                    : "var(--color-text-secondary)",
                border:      `1px solid ${selectedTags.includes(tag) ? "var(--color-brand)" : "var(--color-border)"}`,
                boxShadow:   selectedTags.includes(tag) ? "var(--shadow-brand)"     : "var(--shadow-xs)",
              }}
            >
              #{tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="px-3 py-1.5 rounded-full text-[0.75rem] font-medium transition-colors"
              style={{ color: "var(--color-text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-accent-red)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* No-match message */}
      {filteredItems.length === 0 && selectedTags.length > 0 && (
        <div className="py-12 text-center">
          <p className="text-[0.875rem]" style={{ color: "var(--color-text-muted)" }}>
            No items match the selected tags.
          </p>
        </div>
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold px-3 py-1 rounded-full"
              style={{
                background: "var(--color-brand-soft)",
                color:      "var(--color-brand)",
              }}
            >
              <PushPin size={12} weight="fill" /> Pinned
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-border)" }}
            />
          </div>
          {pinned.map((item) => <ContentItemCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Divider between pinned and regular */}
      {pinned.length > 0 && regular.length > 0 && (
        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-[0.78rem] font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            Recent
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>
      )}

      {/* Regular items */}
      {regular.map((item) => <ContentItemCard key={item.id} item={item} />)}
    </div>
  );
}
