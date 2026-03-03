import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRoomStore } from "../store/roomStore";
import RoomHeader from "../components/room/RoomHeader";
import DropZone from "../components/room/DropZone";
import Timeline from "../components/room/Timeline";
import HistoryPanel from "../components/room/HistoryPanel";
import { AccessMode } from "../../../shared/types";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const {
    room,
    contentItems,
    isLoading,
    fetchRoom,
    fetchContent,
    showHistory,
    reset,
  } = useRoomStore();

  const load = useCallback(async () => {
    if (!code) return;
    await fetchRoom(code);
    await fetchContent(code);
  }, [code, fetchRoom, fetchContent]);

  useEffect(() => {
    load();
    return () => reset();
  }, [load]);

  // Redirect if room not found after loading
  useEffect(() => {
    if (!isLoading && !room && code) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, room, code, navigate]);

  if (isLoading) {
    return <RoomSkeleton />;
  }

  if (!room) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-sm">Room not found or has expired.</p>
          <p className="text-zinc-300 text-xs mt-1">Redirecting...</p>
        </div>
      </div>
    );
  }

  const isReadOnly = room.accessMode === AccessMode.READ_ONLY;
  const isDropOnly = room.accessMode === AccessMode.DROP_ONLY;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col">
      <RoomHeader />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Drop zone / Input (hidden in read-only) */}
          {!isReadOnly && (
            <div className="lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-white overflow-y-auto">
              <DropZone />
            </div>
          )}

          {/* Right: Timeline */}
          <div className="flex-1 overflow-y-auto">
            {isDropOnly ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center px-6">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber-600 text-xl">↓</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-600">Drop-only mode</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    You can add content but cannot view what others have shared.
                  </p>
                </div>
              </div>
            ) : (
              <Timeline items={contentItems} />
            )}
          </div>
        </div>

        {/* History Panel Overlay */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="absolute inset-y-0 right-0 w-full sm:w-[420px] z-20 shadow-2xl"
            >
              <HistoryPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 flex flex-col">
      {/* Header skeleton */}
      <div className="h-14 bg-white border-b border-zinc-200 px-6 flex items-center gap-4">
        <div className="skeleton w-28 h-5 rounded" />
        <div className="skeleton w-20 h-5 rounded" />
        <div className="ml-auto flex gap-2">
          <div className="skeleton w-16 h-7 rounded" />
          <div className="skeleton w-16 h-7 rounded" />
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-80 border-r border-zinc-200 bg-white p-6 flex flex-col gap-4">
          <div className="skeleton w-full h-32 rounded-xl" />
          <div className="skeleton w-full h-20 rounded-xl" />
        </div>
        <div className="flex-1 p-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-full h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
