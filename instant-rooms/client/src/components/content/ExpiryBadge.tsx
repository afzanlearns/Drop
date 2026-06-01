import { useState, useEffect } from "react";
import { Timer } from "@phosphor-icons/react";

interface Props {
  expiresAt: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0)   return `${hours}h ${minutes}m`;
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

  const isUrgent   = remaining < 60 * 60 * 1000;       // < 1 hour
  const isCritical = remaining < 15 * 60 * 1000;       // < 15 min

  return (
    <span
      className="inline-flex items-center gap-1 text-[0.68rem] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: isCritical
          ? "rgba(220,38,38,0.10)"
          : isUrgent
          ? "rgba(217,119,6,0.10)"
          : "var(--color-surface-alt)",
        color: isCritical
          ? "var(--color-accent-red)"
          : isUrgent
          ? "var(--color-accent-amber)"
          : "var(--color-text-muted)",
        border: `1px solid ${
          isCritical
            ? "rgba(220,38,38,0.20)"
            : isUrgent
            ? "rgba(217,119,6,0.20)"
            : "var(--color-border)"
        }`,
      }}
    >
      <Timer size={10} weight={isCritical ? "fill" : "regular"} />
      Deletes in {formatCountdown(remaining)}
    </span>
  );
}
