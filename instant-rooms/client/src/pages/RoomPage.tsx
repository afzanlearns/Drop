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
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="text-center">
          <p className="text-[0.9rem] font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Room not found or has expired.
          </p>
          <p className="text-[0.78rem] mt-1" style={{ color: "var(--color-text-muted)" }}>
            Redirecting…
          </p>
        </div>
      </div>
    );
  }

  const isReadOnly = room.accessMode === AccessMode.READ_ONLY && !isCreator;
  const isDropOnly = room.accessMode === AccessMode.DROP_ONLY && !isCreator;

  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <RoomHeader />

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-0">
          {/* Left: Drop zone */}
          {!isReadOnly && (
            <div
              className="w-full md:w-[272px] flex-shrink-0 flex flex-col overflow-y-auto"
              style={{
                borderRight:  "1px solid var(--color-border)",
                background:   "var(--color-surface)",
              }}
            >
              <DropZone />
            </div>
          )}

          {/* Right: Timeline */}
          <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-bg)" }}>
            {isDropOnly ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center px-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      background: "rgba(217,119,6,0.10)",
                      boxShadow:  "0 4px 20px rgba(217,119,6,0.15)",
                    }}
                  >
                    <span
                      className="text-2xl font-black"
                      style={{ color: "var(--color-accent-amber)" }}
                    >
                      ↓
                    </span>
                  </div>
                  <p
                    className="text-[1.1rem] font-black tracking-tight mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Drop-only mode
                  </p>
                  <p
                    className="text-[0.875rem] leading-[1.6] max-w-[280px] mx-auto"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
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
        {showHistory && (
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-[440px] z-20"
            style={{
              background:  "var(--color-surface)",
              borderLeft:  "1px solid var(--color-border)",
              boxShadow:   "var(--shadow-xl)",
            }}
          >
            <HistoryPanel />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Loading Skeleton ── */
function RoomSkeleton() {
  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Header skeleton */}
      <div
        className="h-[64px] px-5 flex items-center gap-4 flex-shrink-0"
        style={{
          background:   "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="skeleton w-36 h-6 rounded-lg" />
        <div className="skeleton w-16 h-5 rounded-full ml-2" />
        <div className="ml-auto flex gap-2">
          <div className="skeleton w-24 h-8 rounded-lg" />
          <div className="skeleton w-20 h-8 rounded-lg" />
        </div>
      </div>

      {/* Activity bar skeleton */}
      <div
        className="h-[40px] px-5 flex items-center gap-4 flex-shrink-0"
        style={{
          background:   "var(--color-surface-alt)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="skeleton w-16 h-4 rounded" />
        <div className="skeleton w-20 h-4 rounded" />
        <div className="skeleton w-28 h-4 rounded" />
      </div>

      {/* Body skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div
          className="w-[272px] flex-shrink-0 p-4 flex flex-col gap-4"
          style={{
            background:  "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          <div className="skeleton w-full h-36 rounded-xl" />
          <div className="skeleton w-full h-20 rounded-xl" />
          <div className="skeleton w-full h-20 rounded-xl" />
        </div>
        <div className="flex-1 p-5 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-full h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
