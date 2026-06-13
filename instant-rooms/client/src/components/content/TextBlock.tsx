import { useState } from "react";
import type { ContentItem } from "../../../../shared/types";
import { downloadFile } from "../../utils/downloadFile";

interface Props {
  item: ContentItem;
}

export default function TextBlock({ item }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const content = item.content ?? "";
  const lines = content.split("\n");
  const isLong = lines.length > 10 || content.length > 500;
  const preview = isLong && !expanded ? lines.slice(0, 8).join("\n") + "\n..." : content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!item.fileUrl || downloading) return;
    setDownloading(true);
    try {
      const filename = item.metadata.filename ?? item.title ?? "text.txt";
      await downloadFile(item.fileUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <p className="text-body whitespace-pre-wrap break-words" style={{ color: 'var(--text-primary)' }}>
        {preview}
      </p>

      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)}
            className="font-mono text-data"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {expanded ? "Show less" : `Show all ${lines.length} lines`}
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {item.fileUrl && (
            <button onClick={handleDownload} disabled={downloading}
              className="font-mono text-data px-2.5 py-1"
              style={{
                background: 'var(--bg-elevated)',
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
            className="font-mono text-data px-2.5 py-1"
            style={{
              background: copied ? 'rgba(42,122,75,0.15)' : 'var(--bg-elevated)',
              color: copied ? 'var(--success)' : 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
