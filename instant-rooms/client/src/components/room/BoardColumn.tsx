import { Icon } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";
import ContentItemCard from "../content/ContentItem";

interface BoardColumnProps {
  title: string;
  count: number;
  icon: Icon;
  accentColor: string;
  items: ContentItem[];
  emptyMessage: string;
  isCreator: boolean;
}

export default function BoardColumn({
  title,
  count,
  icon: IconComponent,
  accentColor,
  items,
  emptyMessage,
}: BoardColumnProps) {
  const pinned  = items.filter((i) => i.isPinned);
  const regular = items.filter((i) => !i.isPinned);

  return (
    <div
      className="flex-1 flex flex-col min-w-[300px] h-full overflow-hidden"
      style={{
        background:   "var(--color-surface)",
        border:       "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow:    "var(--shadow-sm)",
      }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background:   "var(--color-surface-alt)",
          borderLeft:   `3px solid ${accentColor}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}18` }}
          >
            <IconComponent size={17} style={{ color: accentColor }} weight="bold" />
          </div>
          <h3
            className="text-[0.9rem] font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h3>
        </div>

        <span
          className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `${accentColor}18`,
            color:      accentColor,
          }}
        >
          {count} {count === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Scrollable Area */}
      <div
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[60vh]"
        style={{ background: "var(--color-bg)" }}
      >
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <IconComponent size={48} weight="regular" style={{ color: "var(--color-text-muted)" }} />
            <p
              className="text-[0.85rem] font-semibold mt-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              {emptyMessage}
            </p>
            <p
              className="text-[0.75rem] mt-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              Use the panel on the left to add content
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Pinned Section */}
            {pinned.length > 0 && (
              <div
                className="flex flex-col gap-3 pb-3 mb-1"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--color-brand-soft)",
                      color:      "var(--color-brand)",
                    }}
                  >
                    Pinned
                  </span>
                </div>
                {pinned.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl overflow-hidden"
                    style={{ borderTop: `2px solid ${accentColor}` }}
                  >
                    <ContentItemCard item={item} />
                  </div>
                ))}
              </div>
            )}

            {/* Regular */}
            {regular.map((item) => (
              <ContentItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
