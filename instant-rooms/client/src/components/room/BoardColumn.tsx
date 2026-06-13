import type { ContentItem } from "../../../../shared/types";
import ContentItemCard from "../content/ContentItem";

interface BoardColumnProps {
  title: string;
  count: number;
  accentColor: string;
  items: ContentItem[];
  emptyMessage: string;
  isCreator: boolean;
}

export default function BoardColumn({
  title,
  count,
  accentColor,
  items,
  emptyMessage,
}: BoardColumnProps) {
  const pinned  = items.filter((i) => i.isPinned);
  const regular = items.filter((i) => !i.isPinned);

  return (
    <div className="flex-1 flex flex-col min-w-[280px] h-full overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderTop: '2px solid ' + accentColor }}
    >
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
      >
        <span className="font-mono text-label uppercase" style={{ color: 'var(--text-primary)' }}>{title}</span>
        <span className="font-mono text-label" style={{ color: accentColor }}>{count}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[50vh]" style={{ background: 'var(--bg-base)' }}>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{emptyMessage}</p>
            <p className="font-mono text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Use the panel on the left to add content</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pinned.length > 0 && (
              <div className="flex flex-col gap-3 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-label" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', alignSelf: 'flex-start' }}>
                  Pinned
                </span>
                {pinned.map((item) => <ContentItemCard key={item.id} item={item} />)}
              </div>
            )}
            {regular.map((item) => <ContentItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
