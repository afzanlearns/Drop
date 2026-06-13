import { useEffect, useRef, useState } from "react";
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
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function CodeBlock({ item }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const content = item.content ?? "";
  const language = item.metadata.language ?? "plaintext";
  const lines = content.split("\n");
  const isLong = lines.length > 20;
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

  const handleDownload = async () => {
    if (!item.fileUrl || downloading) return;
    setDownloading(true);
    try {
      const filename = item.metadata.filename ?? item.title ?? "code.txt";
      await downloadFile(item.fileUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="font-mono text-label" style={{ color: 'var(--text-info)' }}>
          {language}
        </span>
        <div className="flex items-center gap-2">
          {item.fileUrl && (
            <button onClick={handleDownload} disabled={downloading}
              className="font-mono text-data px-2 py-1"
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {downloading ? "..." : "Download"}
            </button>
          )}
          <button onClick={handleCopy}
            className="font-mono text-data px-2 py-1"
            style={{
              background: copied ? 'rgba(42,122,75,0.15)' : 'var(--bg-surface)',
              color: copied ? 'var(--success)' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <pre className={`!bg-transparent !m-0 !p-0 language-${language} text-xs leading-[1.65]`}>
          <code ref={codeRef} className={`language-${language}`} />
        </pre>
      </div>

      {isLong && (
        <div className="flex justify-center py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setExpanded(!expanded)}
            className="font-mono text-data px-3 py-1"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            {expanded ? "Collapse" : `Show all ${lines.length} lines`}
          </button>
        </div>
      )}
    </div>
  );
}
