import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useRoomStore } from "../../store/roomStore";
import { useGuestName } from "../../hooks/useGuestName";
import { useCreator } from "../../hooks/useCreator";
import type { ItemExpiryOption } from "../../../../shared/types";

type InputMode = "idle" | "text" | "code";

type ConfirmKind = "files" | "text";

const EXPIRY_OPTIONS: { value: ItemExpiryOption | 0; label: string }[] = [
  { value: 0,  label: "Never"    },
  { value: 1,  label: "1 hour"   },
  { value: 6,  label: "6 hours"  },
  { value: 24, label: "24 hours" },
];

function detectCode(content: string): boolean {
  const patterns = [
    /^\s*(import|export|const|let|var|function|class|if|for|while)\s/m,
    /^\s*(def |class |import |from )\S/m,
    /[{}]\s*$/m,
    /=>\s*{/,
    /^\s*<[a-z][a-z0-9]*[\s/>]/im,
  ];
  return patterns.some((p) => p.test(content));
}

function TagInput({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized && !tags.includes(normalized)) setTags([...tags, normalized]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(inputValue); }
  };

  return (
    <div className="flex flex-wrap gap-1 min-h-[32px] p-1.5"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
    >
      {tags.map((tag, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
        >
          #{tag}
          <button onClick={() => setTags(tags.filter((_, j) => j !== i))}
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? "Add tags..." : ""}
        className="flex-1 min-w-[60px] font-mono text-xs outline-none bg-transparent"
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  );
}

function AutoDeleteSelector({
  value, onChange,
}: {
  value: ItemExpiryOption | 0;
  onChange: (v: ItemExpiryOption | 0) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = EXPIRY_OPTIONS.find((o) => o.value === value)?.label || "Never";

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full font-mono text-xs px-3 py-2"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      >
        <span>
          Auto-delete: <span style={{ color: 'var(--accent)' }}>{currentLabel}</span>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 bottom-full mb-1 z-20"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            {EXPIRY_OPTIONS.map((o) => (
              <button key={o.value}
                onClick={() => { onChange(o.value as ItemExpiryOption | 0); setOpen(false); }}
                className="w-full text-left px-3 py-2 font-mono text-xs"
                style={{
                  background: value === o.value ? 'var(--accent-dim)' : 'transparent',
                  color: value === o.value ? 'var(--accent)' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => { if (value !== o.value) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={(e) => { if (value !== o.value) e.currentTarget.style.background = 'transparent'; }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DropZone() {
  const navigate = useNavigate();
  const { uploadFile, addTextContent, isUploading, room } = useRoomStore();
  const [guestName, setGuestName] = useGuestName();
  const { isCreator } = useCreator(room?.code);

  const [mode, setMode] = useState<InputMode>("idle");
  const [textValue, setTextValue] = useState("");
  const [title, setTitle] = useState("");
  const [detectedAsCode, setDetectedAsCode] = useState(false);
  const [itemExpiry, setItemExpiry] = useState<ItemExpiryOption | 0>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [nameInput, setNameInput] = useState(guestName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; files?: File[] } | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setConfirm({ kind: "files", files: acceptedFiles });
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: mode !== "idle",
    maxSize: 10 * 1024 * 1024,
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text) setDetectedAsCode(detectCode(text));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextValue(val);
    if (val.length > 30) setDetectedAsCode(detectCode(val));
  };

  const handleRequestConfirmText = () => {
    if (!textValue.trim()) return;
    setConfirm({ kind: "text" });
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirm(null);
    const expiry = itemExpiry === 0 ? undefined : (itemExpiry as ItemExpiryOption);
    if (confirm.kind === "files" && confirm.files) {
      for (const file of confirm.files) {
        await uploadFile(file, guestName || undefined, expiry, tags, note || undefined);
      }
      setTags([]); setNote("");
    } else if (confirm.kind === "text") {
      await addTextContent({
        type: detectedAsCode ? "code" : "text",
        content: textValue.trim(),
        title: title.trim() || undefined,
        uploaderName: guestName || undefined,
        itemExpiryHours: expiry,
        tags,
        note: note.trim() || undefined,
      });
      setTextValue(""); setTitle(""); setMode("idle");
      setDetectedAsCode(false); setItemExpiry(0); setTags([]); setNote("");
    }
  };

  const handleCancel = () => {
    setMode("idle"); setTextValue(""); setTitle("");
    setDetectedAsCode(false); setItemExpiry(0); setTags([]); setNote("");
  };

  const openTextMode = (forceCode = false) => {
    setMode(forceCode ? "code" : "text");
    setDetectedAsCode(forceCode);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSaveName = () => {
    setGuestName(nameInput);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="font-mono text-label uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Posting as</p>
        <div className="flex items-center gap-2 px-2.5 py-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
            placeholder="Your name..."
            maxLength={100}
            className="flex-1 font-mono text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div {...getRootProps()}
          className="py-6 px-4 text-center cursor-pointer mb-3"
          style={{
            border: '1px dashed ' + (isDragActive ? 'var(--accent)' : 'var(--border-default)'),
            background: isDragActive ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          }}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>Uploading...</p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: isDragActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 14V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: isDragActive ? 'var(--accent)' : 'var(--text-primary)' }}>
                {isDragActive ? "Drop it!" : "Drop files here"}
              </p>
              {!isDragActive && (
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  Images, PDFs, any file up to 10MB
                </p>
              )}
            </div>
          )}
        </div>

        {mode === "idle" ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => openTextMode(false)} className="btn-secondary">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1.5" y="1.5" width="9" height="1.5" rx="0.3" fill="currentColor"/><rect x="1.5" y="4.5" width="7" height="1" rx="0.3" fill="currentColor"/><rect x="1.5" y="7.5" width="8" height="1" rx="0.3" fill="currentColor"/></svg>
              Text
            </button>
            <button onClick={() => openTextMode(true)} className="btn-secondary">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 3L1.5 6L4 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 3L10.5 6L8 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 1.5L5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="input-field"
            />
            {detectedAsCode && (
              <span className="font-mono text-label" style={{ color: 'var(--accent)' }}>CODE DETECTED</span>
            )}
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={mode === "code" ? "Paste your code here..." : "Type or paste text..."}
              rows={6}
              className="w-full px-3 py-2 font-mono text-xs outline-none resize-none"
              style={{
                background: detectedAsCode ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--border-strong)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
            <div className="flex gap-2">
              <button
                onClick={handleRequestConfirmText}
                disabled={!textValue.trim() || isUploading}
                className="btn-primary flex-1"
              >
                Add
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <p className="font-mono text-label uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Note</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note to your upload..."
            maxLength={200}
            className="input-field"
          />
        </div>
        {isCreator && (
          <div>
            <p className="font-mono text-label uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Auto-delete</p>
            <AutoDeleteSelector value={itemExpiry} onChange={setItemExpiry} />
          </div>
        )}
        <div>
          <p className="font-mono text-label uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Tags</p>
          <TagInput tags={tags} setTags={setTags} />
        </div>
      </div>

      {mode === "idle" && (
        <div className="px-4 py-3 flex-1">
          <p className="font-mono text-data text-center" style={{ color: 'var(--text-muted)' }}>
            You can also paste directly anywhere on the page
          </p>
        </div>
      )}

      <div className="p-4 mt-auto" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button onClick={() => navigate("/")} className="btn-ghost w-full" style={{ border: '1px solid var(--border-default)' }}>
          Back to home
        </button>
      </div>

      {confirm && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setConfirm(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirm(null)}
          >
            <div className="w-full max-w-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Confirm upload</p>
              </div>
              <div className="px-4 py-3 space-y-2 max-h-[50vh] overflow-y-auto">
                {confirm.kind === "files" && confirm.files?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
                {confirm.kind === "text" && (
                  <p className="font-mono text-xs whitespace-pre-wrap break-words max-h-28 overflow-y-auto"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {textValue.trim().slice(0, 500)}{textValue.trim().length > 500 ? "..." : ""}
                  </p>
                )}
                {title && (
                  <div className="flex gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span className="uppercase">Title:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
                  </div>
                )}
                {note && (
                  <div className="flex gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span className="uppercase">Note:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{note}</span>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span className="uppercase">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span key={t} style={{ color: 'var(--accent)' }}>#{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {itemExpiry !== 0 && (
                  <div className="flex gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span className="uppercase">Auto-delete:</span>
                    <span style={{ color: 'var(--accent)' }}>{EXPIRY_OPTIONS.find((o) => o.value === itemExpiry)?.label}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <button onClick={handleConfirm} disabled={isUploading}
                  className="btn-primary flex-1"
                >
                  {isUploading ? "Uploading..." : "Confirm"}
                </button>
                <button onClick={() => setConfirm(null)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
