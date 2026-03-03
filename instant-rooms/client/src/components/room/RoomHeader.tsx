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
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useRoomStore } from "../../store/roomStore";
import { AccessMode, ExpiryOption } from "../../../../shared/types";
import { exportApi } from "../../utils/api";

const ACCESS_MODES: { value: AccessMode; label: string; desc: string }[] = [
  { value: AccessMode.FULL_ACCESS, label: "Full Access", desc: "View + upload + delete" },
  { value: AccessMode.READ_ONLY, label: "Read Only", desc: "View only, no uploads" },
  { value: AccessMode.DROP_ONLY, label: "Drop Only", desc: "Upload only, can't view" },
];

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: 1, label: "1 hour" },
  { value: 24, label: "24 hours" },
  { value: 168, label: "7 days" },
];

export default function RoomHeader() {
  const navigate = useNavigate();
  const { room, updateAccessMode, updateExpiry, pinRoom, setShowHistory } = useRoomStore();
  const [copied, setCopied] = useState(false);
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [showExpiryMenu, setShowExpiryMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  if (!room) return null;

  const expiresAt = room.expiresAt ? new Date(room.expiresAt) : null;
  const timeLeft = expiresAt ? formatDistanceToNow(expiresAt, { addSuffix: true }) : null;
  const isExpiringSoon =
    expiresAt && !room.isPinned && expiresAt.getTime() - Date.now() < 2 * 60 * 60 * 1000;

  const handleCopy = async () => {
    const url = `${window.location.origin}/room/${room.code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (type: "zip" | "md" | "pdf") => {
    setIsExporting(type);
    setShowExportMenu(false);
    try {
      if (type === "zip") await exportApi.zip(room.code);
      else if (type === "md") await exportApi.markdown(room.code);
      else await exportApi.pdf(room.code);
    } finally {
      setIsExporting(null);
    }
  };

  const currentAccessLabel =
    ACCESS_MODES.find((m) => m.value === room.accessMode)?.label ?? "Full Access";

  return (
    <header className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center gap-3 z-10 flex-shrink-0">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        title="Back to home"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="w-px h-5 bg-zinc-200" />

      {/* Room code */}
      <div className="flex items-center gap-1.5">
        <Hash size={14} weight="bold" className="text-emerald-500" />
        <span className="font-mono font-semibold text-sm text-zinc-800 tracking-wide">
          {room.code}
        </span>
      </div>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
        title="Copy room link"
      >
        {copied ? (
          <Check size={14} className="text-emerald-500" />
        ) : (
          <Copy size={14} />
        )}
      </button>

      <div className="w-px h-5 bg-zinc-200" />

      {/* Access mode */}
      <div className="relative">
        <button
          onClick={() => {
            setShowAccessMenu((v) => !v);
            setShowExpiryMenu(false);
            setShowExportMenu(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          {room.accessMode === AccessMode.READ_ONLY ? (
            <EyeSlash size={13} />
          ) : (
            <Eye size={13} />
          )}
          {currentAccessLabel}
          <CaretDown size={10} />
        </button>
        <AnimatePresence>
          {showAccessMenu && (
            <DropMenu onClose={() => setShowAccessMenu(false)}>
              {ACCESS_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => {
                    updateAccessMode(mode.value);
                    setShowAccessMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-zinc-50 transition-colors ${
                    room.accessMode === mode.value ? "text-emerald-600 font-medium" : "text-zinc-700"
                  }`}
                >
                  <div>{mode.label}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </DropMenu>
          )}
        </AnimatePresence>
      </div>

      {/* Expiry */}
      <div className="relative hidden sm:block">
        <button
          onClick={() => {
            setShowExpiryMenu((v) => !v);
            setShowAccessMenu(false);
            setShowExportMenu(false);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-zinc-100 transition-colors ${
            isExpiringSoon ? "text-amber-600" : "text-zinc-500"
          }`}
        >
          {isExpiringSoon ? <Warning size={13} /> : <Clock size={13} />}
          {room.isPinned ? "Pinned" : timeLeft ?? "No expiry"}
          <CaretDown size={10} />
        </button>
        <AnimatePresence>
          {showExpiryMenu && (
            <DropMenu onClose={() => setShowExpiryMenu(false)}>
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateExpiry(opt.value);
                    setShowExpiryMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </DropMenu>
          )}
        </AnimatePresence>
      </div>

      {/* Pin */}
      <button
        onClick={() => pinRoom(!room.isPinned)}
        title={room.isPinned ? "Unpin room" : "Pin room (never expires)"}
        className={`hidden sm:flex p-1.5 rounded-lg transition-colors ${
          room.isPinned
            ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
        }`}
      >
        {room.isPinned ? <PushPin size={14} weight="fill" /> : <PushPinSlash size={14} />}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* History */}
      <button
        onClick={() => setShowHistory(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
      >
        <ClockClockwise size={14} />
        <span className="hidden sm:inline">History</span>
      </button>

      {/* Export */}
      <div className="relative">
        <button
          onClick={() => {
            setShowExportMenu((v) => !v);
            setShowAccessMenu(false);
            setShowExpiryMenu(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors active:scale-[0.98]"
        >
          {isExporting ? (
            <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <DownloadSimple size={14} />
          )}
          Export
        </button>
        <AnimatePresence>
          {showExportMenu && (
            <DropMenu onClose={() => setShowExportMenu(false)} align="right">
              {(["zip", "md", "pdf"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleExport(type)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-mono uppercase tracking-wider text-xs"
                >
                  .{type}
                </button>
              ))}
            </DropMenu>
          )}
        </AnimatePresence>
      </div>
    </header>
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
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute top-full mt-1.5 z-20 bg-white border border-zinc-200 rounded-xl shadow-diffuse p-1.5 min-w-[180px] ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {children}
      </motion.div>
    </>
  );
}
