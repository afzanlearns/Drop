import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-5 w-full max-w-[300px] p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>Share Room</span>
          <button onClick={onClose} className="font-mono text-label" style={{ color: 'var(--text-secondary)' }}>
            Close
          </button>
        </div>

        <div className="p-4" style={{ background: '#fff' }}>
          <QRCodeSVG value={url} size={160} bgColor="#ffffff" fgColor="#0C0C0C" level="M" />
        </div>

        <div className="text-center w-full">
          <p className="font-mono text-label uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>Room Code</p>
          <p className="font-mono font-semibold text-2xl tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
            {roomCode}
          </p>
        </div>

        <p className="font-mono text-data truncate max-w-full w-full text-center" style={{ color: 'var(--text-muted)' }}>
          {url}
        </p>

        <button onClick={handleCopy} className="btn-primary w-full">
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
