import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";

interface Props {
  item: ContentItem;
}

export default function TextBlock({ item }: Props) {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content = item.content ?? "";
  const lines   = content.split("\n");
  const isLong  = lines.length > 10 || content.length > 500;
  const preview = isLong && !expanded ? lines.slice(0, 8).join("\n") + "\n..." : content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p
        className="text-[0.9rem] leading-relaxed whitespace-pre-wrap break-words"
        style={{ color: "var(--color-text-primary)" }}
      >
        {preview}
      </p>

      <div
        className="flex items-center gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid var(--color-border-soft)" }}
      >
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[0.75rem] font-medium transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-brand)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
          >
            {expanded ? "Show less" : `Show all ${lines.length} lines`}
          </button>
        )}

        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 text-[0.75rem] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150"
          style={{
            background: copied ? "rgba(34,197,94,0.10)" : "var(--color-surface-alt)",
            color:      copied ? "var(--color-accent-green)" : "var(--color-text-secondary)",
            border:     "1px solid var(--color-border)",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = "var(--color-brand-soft)";
              (e.currentTarget as HTMLElement).style.color      = "var(--color-brand)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-brand)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background   = "var(--color-surface-alt)";
              (e.currentTarget as HTMLElement).style.color        = "var(--color-text-secondary)";
              (e.currentTarget as HTMLElement).style.borderColor  = "var(--color-border)";
            }
          }}
        >
          {copied ? <Check size={13} weight="bold" /> : <Copy size={13} weight="bold" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
