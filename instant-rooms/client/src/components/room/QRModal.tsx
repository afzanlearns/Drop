import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { X, Copy, Check } from "@phosphor-icons/react";

interface Props {
  roomCode: string;
  onClose: () => void;
}

export default function QRModal({ roomCode, onClose }: Props) {
  const url = `${window.location.origin}/room/${roomCode}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-6 w-full max-w-[320px] p-7"
        style={{
          background:   "var(--color-surface)",
          border:       "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow:    "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <span
            className="font-black text-[1rem] tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Share Room
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-alt)";
              (e.currentTarget as HTMLElement).style.color      = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color      = "var(--color-text-secondary)";
            }}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* QR Code */}
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "#fff",
            boxShadow:  "var(--shadow-md)",
          }}
        >
          <QRCodeSVG
            value={url}
            size={180}
            bgColor="#ffffff"
            fgColor="#09090b"
            level="M"
          />
        </div>

        {/* Room code display */}
        <div className="text-center w-full">
          <p
            className="text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            Room Code
          </p>
          <p
            className="font-mono font-black text-3xl tracking-[0.12em]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {roomCode}
          </p>
        </div>

        {/* URL display */}
        <p
          className="text-[0.7rem] font-mono truncate max-w-full px-2 pb-1 w-full text-center"
          style={{
            color:        "var(--color-text-muted)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {url}
        </p>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[0.875rem] font-semibold transition-all duration-200 ${
            copied ? "" : "btn-primary"
          }`}
          style={
            copied
              ? {
                  background:  "rgba(34,197,94,0.10)",
                  border:      "1px solid rgba(34,197,94,0.30)",
                  color:       "var(--color-accent-green)",
                  borderRadius: "var(--radius-md)",
                }
              : {}
          }
        >
          {copied ? (
            <>
              <Check size={17} weight="bold" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={17} weight="bold" />
              Copy link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
