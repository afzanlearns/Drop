import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRoomStore } from "../../store/roomStore";
import { useCreator } from "../../hooks/useCreator";
import { AccessMode, ExpiryOption } from "../../../../shared/types";
import { exportApi } from "../../utils/api";
import QRModal from "./QRModal";

function BackIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function EditIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4.5 9.5L1 10L1.5 6.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>; }
function HistoryIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ShareIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="4.5" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 9L9 8M6 5L9 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ExportIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V9M7 9L4 6M7 9L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 9V11.5C2 12.3284 2.67157 13 3.5 13H10.5C11.3284 13 12 12.3284 12 11.5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CreatorIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 12.5C2 10 4.5 8.5 7 8.5C9.5 8.5 12 10 12 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ActiveDot() { return <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><circle cx="3" cy="3" r="2.5" fill="currentColor"/></svg>; }
function ListIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="2" width="2" height="2" rx="0.3" fill="currentColor"/><rect x="5.5" y="2.5" width="5" height="1" rx="0.3" fill="currentColor"/><rect x="2" y="5" width="2" height="2" rx="0.3" fill="currentColor"/><rect x="5.5" y="5.5" width="5" height="1" rx="0.3" fill="currentColor"/><rect x="2" y="8" width="2" height="2" rx="0.3" fill="currentColor"/><rect x="5.5" y="8.5" width="5" height="1" rx="0.3" fill="currentColor"/></svg>; }
function CompactIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="6.5" y="1.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="1.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="6.5" y="6.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/></svg>; }
function BoardIcon() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="5.5" y="1.5" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="5.5" y="6.5" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/></svg>; }

const ACCESS_MODES: { value: AccessMode; label: string; desc: string }[] = [
  { value: AccessMode.FULL_ACCESS, label: "Full Access",  desc: "View + upload + delete" },
  { value: AccessMode.READ_ONLY,   label: "Read Only",    desc: "View only, no uploads" },
  { value: AccessMode.DROP_ONLY,   label: "Drop Only",    desc: "Upload only, can't view" },
];

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: 1,   label: "1 hour"  },
  { value: 24,  label: "24 hours" },
  { value: 168, label: "7 days"  },
];

export default function RoomHeader() {
  const navigate = useNavigate();
  const { room, updateAccessMode, updateExpiry, pinRoom, setShowHistory, updateRoomName, viewMode, setViewMode } = useRoomStore();
  const { isCreator } = useCreator(room?.code);

  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  if (!room) return null;

  const expiresAt = room.expiresAt ? new Date(room.expiresAt) : null;
  const timeLeft = expiresAt ? formatDistanceToNow(expiresAt, { addSuffix: true }) : null;
  const isExpiringSoon = expiresAt && !room.isPinned && expiresAt.getTime() - Date.now() < 2 * 60 * 60 * 1000;

  const handleExport = async (type: "zip" | "md" | "pdf") => {
    setIsExporting(type);
    setShowExportMenu(false);
    try {
      if (type === "zip") await exportApi.zip(room.code);
      else if (type === "md") await exportApi.markdown(room.code);
      else await exportApi.pdf(room.code);
    } finally { setIsExporting(null); }
  };

  const handleStartEditName = () => { setNameInput(room.name ?? ""); setEditingName(true); };
  const handleSaveName = async () => {
    setEditingName(false);
    if (nameInput.trim() !== (room.name ?? "")) await updateRoomName(nameInput.trim());
  };
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") setEditingName(false);
  };

  const currentAccessLabel = ACCESS_MODES.find((m) => m.value === room.accessMode)?.label ?? "Full Access";
  const lastActivity = formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true });

  const pillBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    fontFamily: "'Geist Mono', monospace",
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "border-color 100ms, color 100ms",
    whiteSpace: "nowrap" as const,
    minHeight: 28,
  };

  const iconBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    fontFamily: "'Geist Mono', monospace",
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "color 100ms",
    background: "none",
    border: "none",
    padding: "0.25rem 0.5rem",
  };

  return (
    <>
      <header className="flex-shrink-0 px-3 md:px-5 flex items-center justify-between"
        style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', height: 44 }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={() => navigate("/")} style={iconBtn} title="Back to home" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <BackIcon /> Back
          </button>

          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onBlur={handleSaveName} onKeyDown={handleNameKeyDown}
                maxLength={100} placeholder="Room name..."
                className="font-mono text-sm px-2 py-1 outline-none w-36 md:w-40"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
              />
              <button onClick={handleSaveName} className="font-mono text-label" style={{ color: 'var(--accent)' }}>Save</button>
              <button onClick={() => setEditingName(false)} className="font-mono text-label" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-medium truncate leading-none hidden xs:inline" style={{ fontSize: 'clamp(0.8125rem, 1.5vw, 1.125rem)', color: 'var(--text-primary)' }}>
                {room.name ? room.name : room.code}
              </span>
              <span className="font-mono text-label flex items-center gap-1" style={{ color: 'var(--success)' }}>
                <ActiveDot /> Active
              </span>
              {isCreator && (
                <button onClick={handleStartEditName} style={iconBtn} title="Edit room name" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  <EditIcon />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="segment-control">
            <button onClick={() => setViewMode("list")} className={`segment-btn ${viewMode === "list" ? "active" : ""}`}><ListIcon /> List</button>
            <button onClick={() => setViewMode("compact")} className={`segment-btn ${viewMode === "compact" ? "active" : ""}`}><CompactIcon /> Compact</button>
            <button onClick={() => setViewMode("board")} className={`segment-btn hidden lg:inline-flex ${viewMode === "board" ? "active" : ""}`}><BoardIcon /> Board</button>
          </div>

          <div className="w-px h-3" style={{ background: 'var(--border-subtle)' }} />

          <div className="relative">
            <button onClick={() => { if (isCreator) { setShowAccessMenu((v) => !v); setShowExpiryMenu(false); setShowExportMenu(false); } }}
              style={{ ...pillBtn, color: isExpiringSoon ? 'var(--warning)' : 'var(--text-primary)', borderColor: isExpiringSoon ? 'var(--warning)' : 'var(--border-default)', cursor: isCreator ? "pointer" : "default" }}
            >
              {currentAccessLabel}
              {isCreator && <span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>}
            </button>
            {showAccessMenu && isCreator && (
              <DropMenu onClose={() => setShowAccessMenu(false)}>
                {ACCESS_MODES.map((mode) => (
                  <button key={mode.value} onClick={() => { updateAccessMode(mode.value); setShowAccessMenu(false); }}
                    className="w-full text-left px-4 py-2 font-mono text-xs transition-colors"
                    style={{ background: room.accessMode === mode.value ? 'var(--accent-dim)' : 'transparent', color: room.accessMode === mode.value ? 'var(--accent)' : 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => { if (room.accessMode !== mode.value) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                    onMouseLeave={(e) => { if (room.accessMode !== mode.value) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div>{mode.label}</div>
                    <div className="font-mono text-xs" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{mode.desc}</div>
                  </button>
                ))}
              </DropMenu>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { if (isCreator) { setShowExpiryMenu((v) => !v); setShowAccessMenu(false); setShowExportMenu(false); } }}
              style={{ ...pillBtn, color: isExpiringSoon ? 'var(--warning)' : 'var(--text-primary)', borderColor: isExpiringSoon ? 'var(--warning)' : 'var(--border-default)', cursor: isCreator ? "pointer" : "default" }}
            >
              {room.isPinned ? "Pinned" : timeLeft ?? "No expiry"}
              {isCreator && <span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>▾</span>}
            </button>
            {showExpiryMenu && isCreator && (
              <DropMenu onClose={() => setShowExpiryMenu(false)}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { updateExpiry(opt.value as ExpiryOption); setShowExpiryMenu(false); }}
                    className="w-full text-left px-4 py-2 font-mono text-xs transition-colors"
                    style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {opt.label}
                  </button>
                ))}
                <button onClick={() => { pinRoom(!room.isPinned); setShowExpiryMenu(false); }}
                  className="w-full text-left px-4 py-2 font-mono text-xs transition-colors"
                  style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-dim)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {room.isPinned ? "Unpin room" : "Pin permanently"}
                </button>
              </DropMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-1 justify-end">
          {isCreator && (
            <span className="hidden md:inline-flex items-center gap-1 font-mono text-label" style={{ color: 'var(--accent)' }}>
              <CreatorIcon /> Creator
            </span>
          )}

          <button onClick={() => setShowHistory(true)} style={iconBtn} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <HistoryIcon /> History
          </button>

          <div className="relative">
            <button onClick={() => { setShowExportMenu((v) => !v); setShowAccessMenu(false); setShowExpiryMenu(false); }} style={{ ...iconBtn, gap: '0.25rem', padding: '0.25rem 0.5rem' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {isExporting ? "..." : <><ExportIcon /> Export ▾</>}
            </button>
            {showExportMenu && (
              <DropMenu onClose={() => setShowExportMenu(false)} align="right">
                {(["zip", "md", "pdf"] as const).map((type) => (
                  <button key={type} onClick={() => handleExport(type)}
                    className="w-full text-left px-4 py-2 font-mono text-xs transition-colors"
                    style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    .{type}
                  </button>
                ))}
              </DropMenu>
            )}
          </div>

          <button onClick={() => setShowQR(true)} style={iconBtn} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
            <ShareIcon /> Share
          </button>
        </div>
      </header>

      <div className="h-8 px-3 md:px-5 flex items-center gap-3 md:gap-4 flex-shrink-0 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        {[
          { val: room.contentCount, label: "items" },
          { val: `${room.viewCount} views`, label: "" },
          { val: lastActivity, label: "last active" },
        ].map(({ val, label }, i) => (
          <span key={i} className="font-mono text-data whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            {i > 0 && <span className="mx-1" style={{ color: 'var(--border-subtle)' }}>/</span>}
            <span style={{ color: 'var(--text-primary)' }}>{val}</span>
            {label && <span className="ml-1">{label}</span>}
          </span>
        ))}
      </div>

      {showQR && <QRModal roomCode={room.code} onClose={() => setShowQR(false)} />}
    </>
  );
}

function DropMenu({ children, onClose, align = "left" }: { children: React.ReactNode; onClose: () => void; align?: "left" | "right" }) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className={`absolute top-full mt-1 z-20 min-w-[160px] drop-menu ${align === "right" ? "right-0" : "left-0"}`}>
        {children}
      </div>
    </>
  );
}
