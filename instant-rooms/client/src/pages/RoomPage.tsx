import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoomStore } from "../store/roomStore";
import RoomHeader from "../components/room/RoomHeader";
import DropZone from "../components/room/DropZone";
import Timeline from "../components/room/Timeline";
import HistoryPanel from "../components/room/HistoryPanel";
import { AccessMode } from "../../../shared/types";
import { useCreator } from "../hooks/useCreator";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate  = useNavigate();
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

  useEffect(() => {
    if (room) {
      document.title = `${room.name ?? room.code} — Instant Rooms`;
    } else {
      document.title = "Instant Rooms";
    }
    return () => { document.title = "Instant Rooms"; };
  }, [room]);

  useEffect(() => {
    if (!isLoading && !room && code) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, room, code, navigate]);

  const { isCreator } = useCreator(room?.code);

  if (isLoading) return <RoomSkeleton />;

  if (!room) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            Room not found or has expired.
          </p>
          <p className="font-mono text-data mt-1" style={{ color: 'var(--text-muted)' }}>
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const isReadOnly = room.accessMode === AccessMode.READ_ONLY && !isCreator;
  const isDropOnly = room.accessMode === AccessMode.DROP_ONLY && !isCreator;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <RoomHeader />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {!isReadOnly && (
            <div className="w-full md:w-64 flex-shrink-0 flex flex-col overflow-y-auto"
              style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
            >
              <DropZone />
            </div>
          )}

          <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
            {isDropOnly ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center px-6">
                  <p className="font-mono font-medium mb-2" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    Drop-only mode
                  </p>
                  <p className="text-body max-w-[280px] mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    You can add content but cannot view what others have shared.
                  </p>
                </div>
              </div>
            ) : (
              <Timeline items={contentItems} />
            )}
          </div>
        </div>

        {showHistory && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-[400px] z-20"
            style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}
          >
            <HistoryPanel />
          </div>
        )}
      </div>
    </div>
  );
}

function RoomSkeleton() {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="h-12 px-5 flex items-center gap-4 flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="skeleton w-8 h-8" />
        <div className="skeleton w-32 h-5" />
        <div className="ml-auto flex gap-2">
          <div className="skeleton w-20 h-8" />
          <div className="skeleton w-20 h-8" />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0 p-4 flex flex-col gap-4"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
        >
          <div className="skeleton w-full h-32" />
          <div className="skeleton w-full h-16" />
          <div className="skeleton w-full h-16" />
        </div>
        <div className="flex-1 p-5 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-full h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
