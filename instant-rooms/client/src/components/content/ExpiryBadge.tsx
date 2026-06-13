import { useState, useEffect } from "react";

interface Props {
  expiresAt: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `< 1m`;
}

export default function ExpiryBadge({ expiresAt }: Props) {
  const [remaining, setRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(new Date(expiresAt).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (remaining <= 0) return null;

  const isUrgent = remaining < 60 * 60 * 1000;
  const isCritical = remaining < 15 * 60 * 1000;

  return (
    <span className="inline-flex items-center gap-1 font-mono text-label px-2 py-0.5"
      style={{
        background: isCritical ? 'var(--accent-dim)' : isUrgent ? 'rgba(138,106,0,0.15)' : 'var(--bg-elevated)',
        color: isCritical ? 'var(--error)' : isUrgent ? 'var(--warning)' : 'var(--text-muted)',
        border: '1px solid ' + (isCritical ? 'var(--error)' : isUrgent ? 'var(--warning)' : 'var(--border-default)'),
      }}
    >
      Deletes in {formatCountdown(remaining)}
    </span>
  );
}
