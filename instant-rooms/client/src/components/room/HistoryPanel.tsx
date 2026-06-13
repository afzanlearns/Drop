import { useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { useRoomStore } from "../../store/roomStore";

export default function HistoryPanel() {
  const { room, history, fetchHistory, restoreSnapshot, setShowHistory } = useRoomStore();

  useEffect(() => {
    if (room) fetchHistory(room.code);
  }, [room, fetchHistory]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-surface)' }}>
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>Version History</span>
        <button onClick={() => setShowHistory(false)} className="font-mono text-label" style={{ color: 'var(--text-secondary)' }}>
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-6"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>No history yet</p>
            <p className="font-mono text-xs mt-1 max-w-[220px]" style={{ color: 'var(--text-muted)' }}>
              Changes will appear here as you edit the room.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="font-mono text-label uppercase pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
              {history.length} snapshot{history.length !== 1 ? "s" : ""} saved
            </p>
            {[...history].reverse().map((snapshot) => (
              <div key={snapshot.snapshotAt}
                className="p-4"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {snapshot.triggerEvent.replace(/_/g, " ")}
                    </p>
                    <p className="font-mono text-data mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(snapshot.snapshotAt), { addSuffix: true })}
                    </p>
                    <p className="font-mono text-data mt-1 px-1.5 py-0.5" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                      {format(new Date(snapshot.snapshotAt), "MMM d, HH:mm:ss")}
                    </p>
                  </div>
                  <span className="font-mono text-label px-2 py-1 flex-shrink-0" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    {snapshot.contentState.filter((i) => !i.isDeleted).length} items
                  </span>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => restoreSnapshot(snapshot.snapshotAt)}
                    className="w-full flex items-center justify-center gap-2 py-2 font-mono text-xs"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-dim)';
                      e.currentTarget.style.color = 'var(--accent)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-surface)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'var(--border-default)';
                    }}
                  >
                    Restore this state
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
