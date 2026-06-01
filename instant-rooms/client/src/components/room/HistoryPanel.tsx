import { useEffect } from "react";
import { X, ClockClockwise, ArrowCounterClockwise } from "@phosphor-icons/react";
import { formatDistanceToNow, format } from "date-fns";
import { useRoomStore } from "../../store/roomStore";

export default function HistoryPanel() {
  const { room, history, fetchHistory, restoreSnapshot, setShowHistory } = useRoomStore();

  useEffect(() => {
    if (room) fetchHistory(room.code);
  }, [room, fetchHistory]);

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--color-surface)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-brand-soft)", color: "var(--color-brand)" }}
          >
            <ClockClockwise size={16} weight="bold" />
          </div>
          <span
            className="font-black text-[1rem] tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Version History
          </span>
        </div>
        <button
          onClick={() => setShowHistory(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
          }}
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-48 text-center rounded-2xl"
            style={{
              background: "var(--color-surface-alt)",
              border:     "1px solid var(--color-border)",
            }}
          >
            <ClockClockwise
              size={32}
              weight="regular"
              style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}
            />
            <p
              className="text-[0.9rem] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              No history yet
            </p>
            <p
              className="text-[0.78rem] mt-1 max-w-[220px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Changes will appear here as you edit the room.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p
              className="text-[0.7rem] font-semibold uppercase tracking-widest pb-2"
              style={{
                color:        "var(--color-text-muted)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {history.length} snapshot{history.length !== 1 ? "s" : ""} saved
            </p>

            {[...history].reverse().map((snapshot) => (
              <div
                key={snapshot.snapshotAt}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: "var(--color-surface-alt)",
                  border:     "1px solid var(--color-border)",
                  boxShadow:  "var(--shadow-xs)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                }}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[0.8rem] font-semibold truncate capitalize"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {snapshot.triggerEvent.replace(/_/g, " ")}
                    </p>
                    <p
                      className="text-[0.75rem] mt-0.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {formatDistanceToNow(new Date(snapshot.snapshotAt), { addSuffix: true })}
                    </p>
                    <p
                      className="text-[0.68rem] font-mono mt-1.5 px-1.5 py-0.5 rounded w-fit"
                      style={{
                        background: "var(--color-surface-2)",
                        color:      "var(--color-text-muted)",
                      }}
                    >
                      {format(new Date(snapshot.snapshotAt), "MMM d, HH:mm:ss")}
                    </p>
                  </div>
                  <span
                    className="text-[0.68rem] font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{
                      background: "var(--color-brand-soft)",
                      color:      "var(--color-brand)",
                    }}
                  >
                    {snapshot.contentState.filter((i) => !i.isDeleted).length} items
                  </span>
                </div>

                <div
                  className="px-4 pb-4"
                >
                  <button
                    onClick={() => restoreSnapshot(snapshot.snapshotAt)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[0.82rem] font-semibold transition-all duration-150"
                    style={{
                      background: "var(--color-surface)",
                      border:     "1px solid var(--color-border)",
                      color:      "var(--color-text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-brand-soft)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-brand)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                    }}
                  >
                    <ArrowCounterClockwise size={15} weight="bold" />
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
