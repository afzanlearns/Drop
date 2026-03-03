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
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const content = item.content ?? "";
  const language = item.metadata.language ?? "plaintext";
  const lines = content.split("\n");
  const isLong = lines.length > 20;
  const displayContent = isLong && !expanded ? lines.slice(0, 18).join("\n") + "\n..." : content;

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
    <div className="relative group">
      <div className="relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
        {/* Code header bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-500 font-mono">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code content */}
        <pre className={`!bg-transparent !m-0 overflow-x-auto language-${language}`}>
          <code
            ref={codeRef}
            className={`language-${language}`}
          />
        </pre>
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {expanded ? `Collapse` : `Show all ${lines.length} lines`}
        </button>
      )}
    </div>
  );
}
