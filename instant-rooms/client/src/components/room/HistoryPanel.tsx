import { useEffect } from "react";
import { X, ClockClockwise, ArrowCounterClockwise } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { useRoomStore } from "../../store/roomStore";

export default function HistoryPanel() {
  const { room, history, fetchHistory, restoreSnapshot, setShowHistory } = useRoomStore();

  useEffect(() => {
    if (room) {
      fetchHistory(room.code);
    }
  }, [room, fetchHistory]);

  return (
    <div className="h-full bg-white border-l border-zinc-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <ClockClockwise size={16} className="text-zinc-500" />
          <span className="font-semibold text-sm text-zinc-800">Version History</span>
        </div>
        <button
          onClick={() => setShowHistory(false)}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <ClockClockwise size={28} className="text-zinc-200 mb-3" />
            <p className="text-sm text-zinc-400">No history yet</p>
            <p className="text-xs text-zinc-300 mt-1">Changes will appear here as you edit the room.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-zinc-400 mb-3">
              {history.length} snapshot{history.length !== 1 ? "s" : ""} saved
            </p>
            {[...history].reverse().map((snapshot, i) => (
              <motion.div
                key={snapshot.snapshotAt}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="group relative border border-zinc-100 rounded-xl p-4 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-700 truncate">
                      {snapshot.triggerEvent.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {formatDistanceToNow(new Date(snapshot.snapshotAt), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-zinc-300 font-mono mt-0.5">
                      {format(new Date(snapshot.snapshotAt), "MMM d, HH:mm:ss")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-zinc-400 font-mono">
                      {snapshot.contentState.filter(i => !i.isDeleted).length} items
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => restoreSnapshot(snapshot.snapshotAt)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium
                             text-zinc-500 border border-zinc-200 rounded-lg hover:bg-white hover:text-zinc-700
                             hover:border-zinc-300 transition-all active:scale-[0.98]"
                >
                  <ArrowCounterClockwise size={12} />
                  Restore this state
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
