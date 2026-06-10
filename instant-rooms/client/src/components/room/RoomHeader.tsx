import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  Copy,
  Check,
  PushPin,
  PushPinSlash,
  Clock,
  Warning,
  DownloadSimple,
  Eye,
  EyeSlash,
  ArrowLeft,
  ClockClockwise,
  CaretDown,
  QrCode,
  PencilSimple,
  X,
  SquaresFour,
  Columns,
  List,
  Crown
} from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { useRoomStore } from "../../store/roomStore";
import { useCreator } from "../../hooks/useCreator";
import { AccessMode, ExpiryOption } from "../../../../shared/types";
import { exportApi } from "../../utils/api";
import QRModal from "./QRModal";
import ThemeToggle from "../layout/ThemeToggle";

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
  const { room, updateAccessMode, updateExpiry, pinRoom, setShowHistory, updateRoomName, viewMode, setViewMode } =
    useRoomStore();
  const { isCreator } = useCreator(room?.code);

  const [copied,         setCopied]         = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showQR,         setShowQR]         = useState(false);
  const [isExporting,    setIsExporting]    = useState<string | null>(null);
  const [editingName,    setEditingName]    = useState(false);
  const [nameInput,      setNameInput]      = useState("");

  if (!room) return null;

  const expiresAt       = room.expiresAt ? new Date(room.expiresAt) : null;
  const timeLeft        = expiresAt ? formatDistanceToNow(expiresAt, { addSuffix: true }) : null;
  const isExpiringSoon  =
    expiresAt && !room.isPinned && expiresAt.getTime() - Date.now() < 2 * 60 * 60 * 1000;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${room.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (type: "zip" | "md" | "pdf") => {
    setIsExporting(type);
    setShowExportMenu(false);
    try {
      if (type === "zip")      await exportApi.zip(room.code);
      else if (type === "md")  await exportApi.markdown(room.code);
      else                     await exportApi.pdf(room.code);
    } finally {
      setIsExporting(null);
    }
  };

  const handleStartEditName = () => {
    setNameInput(room.name ?? "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    setEditingName(false);
    if (nameInput.trim() !== (room.name ?? "")) {
      await updateRoomName(nameInput.trim());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleSaveName();
    if (e.key === "Escape") setEditingName(false);
  };

  const currentAccessLabel =
    ACCESS_MODES.find((m) => m.value === room.accessMode)?.label ?? "Full Access";
  const lastActivity = formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true });

  const closeMenus = () => {
    setShowAccessMenu(false);
    setShowExpiryMenu(false);
    setShowExportMenu(false);
  };

  const pillBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.625rem",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.78rem",
    fontWeight: 500,
    color: "var(--color-text-primary)",
    cursor: "pointer",
    transition: "all 0.12s ease",
    whiteSpace: "nowrap" as const,
  };

  return (
    <>
      <header className="h-14 z-10 flex-shrink-0 px-5 flex items-center justify-between sticky top-0"
        style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 group">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-[5px] transition-all duration-150 flex-shrink-0"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
            }}
            title="Back to home"
          >
            <ArrowLeft size={18} weight="bold" />
          </button>

          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={handleNameKeyDown}
                maxLength={100}
                placeholder="Room name..."
                className="text-sm font-medium px-2.5 py-1.5 rounded-[5px] outline-none w-40"
                style={{
                  background: "var(--color-surface-alt)",
                  border: "1px solid var(--color-brand)",
                  color: "var(--color-text-primary)",
                  boxShadow: "0 0 0 3px var(--color-brand-soft)",
                }}
              />
              <button onClick={handleSaveName} className="p-1.5 rounded-[5px] transition-colors"
                style={{ color: "var(--color-brand)" }}
              >
                <Check size={13} weight="bold" />
              </button>
              <button onClick={() => setEditingName(false)} className="p-1.5 rounded-[5px] transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X size={13} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 cursor-default min-w-0">
              <span className="font-bold tracking-tight truncate leading-none uppercase"
                style={{ color: "var(--color-text-primary)", fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
              >
                {room.name ? room.name : room.code}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[0.6rem] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(22,163,74,0.08)", color: "var(--color-accent-green)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-accent-green)" }} />
                Active
              </span>

              {isCreator && (
                <button
                  onClick={handleStartEditName}
                  className="p-1 rounded-[5px] opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  style={{ color: "var(--color-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)"}
                  title="Edit room name"
                >
                  <PencilSimple size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="segment-control">
            <button onClick={() => setViewMode("list")}
              className={`segment-btn ${viewMode === "list" ? "active" : ""}`}
            >
              <List size={12} /> List
            </button>
            <button onClick={() => setViewMode("compact")}
              className={`segment-btn ${viewMode === "compact" ? "active" : ""}`}
            >
              <SquaresFour size={12} /> Compact
            </button>
            <button onClick={() => setViewMode("board")}
              className={`segment-btn hidden lg:inline-flex ${viewMode === "board" ? "active" : ""}`}
            >
              <Columns size={12} /> Board
            </button>
          </div>

          <div className="w-px h-4" style={{ background: "var(--color-border)" }} />

          <div className="relative">
            <button
              onClick={() => {
                if (isCreator) { setShowAccessMenu((v) => !v); setShowExpiryMenu(false); setShowExportMenu(false); }
              }}
              style={{
                ...pillBtn,
                color: isExpiringSoon ? "var(--color-accent-amber)" : "var(--color-text-primary)",
                borderColor: isExpiringSoon ? "rgba(217,119,6,0.3)" : "var(--color-border)",
                background: isExpiringSoon ? "rgba(217,119,6,0.06)" : "var(--color-surface)",
                cursor: isCreator ? "pointer" : "default",
              }}
            >
              {room.accessMode === AccessMode.READ_ONLY ? <EyeSlash size={13} weight="bold" /> : <Eye size={13} weight="bold" />}
              {currentAccessLabel}
              {isCreator && <CaretDown size={11} weight="bold" style={{ color: "var(--color-text-muted)" }} />}
            </button>

            {showAccessMenu && isCreator && (
              <DropMenu onClose={() => setShowAccessMenu(false)}>
                {ACCESS_MODES.map((mode) => (
                  <button key={mode.value}
                    onClick={() => { updateAccessMode(mode.value); setShowAccessMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-100"
                    style={{
                      background: room.accessMode === mode.value ? "var(--color-brand-soft)" : "transparent",
                      color: room.accessMode === mode.value ? "var(--color-brand)" : "var(--color-text-primary)",
                      borderBottom: "1px solid var(--color-border-soft)",
                    }}
                    onMouseEnter={(e) => {
                      if (room.accessMode !== mode.value)
                        (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                    }}
                    onMouseLeave={(e) => {
                      if (room.accessMode !== mode.value)
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-[0.7rem] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{mode.desc}</div>
                  </button>
                ))}
              </DropMenu>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                if (isCreator) { setShowExpiryMenu((v) => !v); setShowAccessMenu(false); setShowExportMenu(false); }
              }}
              style={{
                ...pillBtn,
                color: isExpiringSoon ? "var(--color-accent-amber)" : "var(--color-text-primary)",
                borderColor: isExpiringSoon ? "rgba(217,119,6,0.3)" : "var(--color-border)",
                background: isExpiringSoon ? "rgba(217,119,6,0.06)" : "var(--color-surface)",
                cursor: isCreator ? "pointer" : "default",
              }}
            >
              {isExpiringSoon
                ? <Warning size={13} weight="bold" style={{ color: "var(--color-accent-amber)" }} />
                : <Clock size={13} weight="bold" />}
              {room.isPinned ? "Pinned" : timeLeft ?? "No expiry"}
              {isCreator && <CaretDown size={11} weight="bold" style={{ color: "var(--color-text-muted)" }} />}
            </button>

            {showExpiryMenu && isCreator && (
              <DropMenu onClose={() => setShowExpiryMenu(false)}>
                {EXPIRY_OPTIONS.map((opt) => (
                  <button key={opt.value}
                    onClick={() => { updateExpiry(opt.value as ExpiryOption); setShowExpiryMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-100"
                    style={{ color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-soft)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => { pinRoom(!room.isPinned); setShowExpiryMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors duration-100"
                  style={{ color: "var(--color-brand)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-brand-soft)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {room.isPinned ? "Unpin room" : "Pin permanently"}
                </button>
              </DropMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {isCreator && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[0.65rem] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: "var(--color-brand-soft)", color: "var(--color-brand)" }}
            >
              <Crown size={11} weight="fill" />
              Creator
            </span>
          )}

          <button
            onClick={() => setShowHistory(true)}
            className="hidden sm:flex items-center gap-1.5 text-[0.78rem] font-medium px-2.5 py-1.5 rounded-[5px] transition-all duration-150 flex-shrink-0"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
            }}
          >
            <ClockClockwise size={14} /> History
          </button>

          <div className="relative">
            <button
              onClick={() => { setShowExportMenu((v) => !v); setShowAccessMenu(false); setShowExpiryMenu(false); }}
              className="btn-primary py-1.5 px-2.5 text-[0.78rem]"
              style={{ gap: "0.375rem" }}
            >
              {isExporting ? (
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <DownloadSimple size={14} weight="bold" />
              )}
              Export
              <CaretDown size={11} weight="bold" />
            </button>

            {showExportMenu && (
              <DropMenu onClose={() => setShowExportMenu(false)} align="right">
                {(["zip", "md", "pdf"] as const).map((type) => (
                  <button key={type}
                    onClick={() => handleExport(type)}
                    className="w-full text-left px-4 py-2.5 text-[0.78rem] font-mono font-medium transition-colors duration-100"
                    style={{ color: "var(--color-text-primary)", borderBottom: "1px solid var(--color-border-soft)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    .{type}
                  </button>
                ))}
              </DropMenu>
            )}
          </div>

          <div className="w-px h-4 hidden sm:block" style={{ background: "var(--color-border)" }} />
          <ThemeToggle />
        </div>
      </header>

      <div className="h-9 px-5 flex items-center gap-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        {[
          { val: room.contentCount, label: "items"    },
          { val: `${room.viewCount} views`, label: "" },
          { val: lastActivity,       label: "last active" },
        ].map(({ val, label }, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[0.7rem]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {i > 0 && <span className="w-px h-3 mr-1.5" style={{ background: "var(--color-border)" }} />}
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{val}</span>
            {label && <span>{label}</span>}
          </span>
        ))}
      </div>

      {showQR && <QRModal roomCode={room.code} onClose={() => setShowQR(false)} />}
    </>
  );
}

function DropMenu({
  children,
  onClose,
  align = "left",
}: {
  children: React.ReactNode;
  onClose: () => void;
  align?: "left" | "right";
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className={`absolute top-full mt-1.5 z-20 min-w-[180px] drop-menu ${align === "right" ? "right-0" : "left-0"}`}>
        {children}
      </div>
    </>
  );
}
