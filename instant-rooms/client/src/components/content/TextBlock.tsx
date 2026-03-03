import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";
import type { ContentItem } from "../../../../shared/types";

interface Props {
  item: ContentItem;
}

export default function TextBlock({ item }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content = item.content ?? "";
  const lines = content.split("\n");
  const isLong = lines.length > 10 || content.length > 500;
  const preview = isLong && !expanded
    ? lines.slice(0, 8).join("\n") + "\n..."
    : content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap break-words">
        {preview}
      </p>

      <div className="flex items-center gap-2 mt-2">
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {expanded ? "Show less" : `Show all ${lines.length} lines`}
          </button>
        )}

        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1 text-xs text-zinc-300 hover:text-zinc-500 transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
