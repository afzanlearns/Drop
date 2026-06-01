import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-php";
import "prismjs/components/prism-css";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import type { ContentItem } from "../../../../shared/types";

interface Props {
  item: ContentItem;
}

export default function CodeBlock({ item }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content        = item.content ?? "";
  const language       = item.metadata.language ?? "plaintext";
  const lines          = content.split("\n");
  const isLong         = lines.length > 20;
  const displayContent = isLong && !expanded
    ? lines.slice(0, 18).join("\n") + "\n..."
    : content;

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.textContent = displayContent;
      Prism.highlightElement(codeRef.current);
    }
  }, [displayContent, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group overflow-hidden"
      style={{
        background:   "var(--color-graphite, #1A1817)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: "var(--radius-sm)",
        boxShadow:    "var(--shadow-md)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* macOS-style dots */}
        <div className="flex gap-1.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
          ))}
        </div>

        <span
          className="text-[0.68rem] font-mono uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {language}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[0.72rem] font-semibold px-2.5 py-1 rounded-lg transition-all duration-150"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
            color:      copied ? "#4ade80"               : "rgba(255,255,255,0.6)",
            border:     "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color      = "rgba(255,255,255,0.9)";
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.color      = "rgba(255,255,255,0.6)";
            }
          }}
        >
          {copied ? <Check size={13} weight="bold" /> : <Copy size={13} weight="bold" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-4">
        <pre className={`!bg-transparent !m-0 !p-0 language-${language} text-[0.8rem] leading-[1.65]`}>
          <code ref={codeRef} className={`language-${language}`} />
        </pre>
      </div>

      {/* Expand / collapse */}
      {isLong && (
        <div
          className="flex justify-center py-2.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[0.72rem] font-semibold px-3 py-1 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.07)",
              color:      "rgba(255,255,255,0.5)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLElement).style.color      = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
              (e.currentTarget as HTMLElement).style.color      = "rgba(255,255,255,0.5)";
            }}
          >
            {expanded ? "Collapse" : `Show all ${lines.length} lines`}
          </button>
        </div>
      )}
    </div>
  );
}
