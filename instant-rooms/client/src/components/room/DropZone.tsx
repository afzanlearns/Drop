import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { UploadSimple, Code, TextT, Plus, X, User, Timer, CaretDown, ArrowLeft } from "@phosphor-icons/react";
import { useRoomStore } from "../../store/roomStore";
import { useGuestName } from "../../hooks/useGuestName";
import { useCreator } from "../../hooks/useCreator";
import type { ItemExpiryOption } from "../../../../shared/types";

type InputMode = "idle" | "text" | "code";

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
    <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-[5px] transition-all"
      style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}
    >
      {tags.map((tag, i) => (
        <span key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.68rem] font-semibold"
          style={{ background: "var(--color-brand-soft)", color: "var(--color-brand)" }}
        >
          #{tag}
          <button onClick={() => setTags(tags.filter((_, j) => j !== i))}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={9} weight="bold" />
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? "Add tags\u2026" : ""}
        className="flex-1 min-w-[80px] text-[0.8rem] outline-none bg-transparent"
        style={{ color: "var(--color-text-primary)" }}
      />
    </div>
  );
}

function AutoDeleteSelector({
  value,
  onChange,
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
        className="flex items-center justify-between w-full text-[0.82rem] px-3 py-2 rounded-[5px] transition-colors font-medium"
        style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)")}
      >
        <span className="flex items-center gap-2">
          <Timer size={14} weight="bold" style={{ color: "var(--color-text-secondary)" }} />
          Auto-delete: <span style={{ color: "var(--color-brand)" }}>{currentLabel}</span>
        </span>
        <CaretDown size={12} weight="bold" style={{ color: "var(--color-text-muted)" }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 bottom-full mb-1.5 z-20 p-1"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-xl)" }}
          >
            {EXPIRY_OPTIONS.map((o) => (
              <button key={o.value}
                onClick={() => { onChange(o.value as ItemExpiryOption | 0); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[0.8rem] font-medium rounded-[4px] transition-colors"
                style={{ background: value === o.value ? "var(--color-brand-soft)" : "transparent", color: value === o.value ? "var(--color-brand)" : "var(--color-text-primary)" }}
                onMouseEnter={(e) => {
                  if (value !== o.value) (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                }}
                onMouseLeave={(e) => {
                  if (value !== o.value) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
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

  const [mode,          setMode]          = useState<InputMode>("idle");
  const [textValue,     setTextValue]     = useState("");
  const [title,         setTitle]         = useState("");
  const [detectedAsCode,setDetectedAsCode]= useState(false);
  const [itemExpiry,    setItemExpiry]    = useState<ItemExpiryOption | 0>(0);
  const [tags,          setTags]          = useState<string[]>([]);
  const [nameInput,     setNameInput]     = useState(guestName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const expiry = itemExpiry === 0 ? undefined : (itemExpiry as ItemExpiryOption);
      for (const file of acceptedFiles) {
        await uploadFile(file, guestName || undefined, expiry, tags);
      }
      setTags([]);
    },
    [uploadFile, guestName, itemExpiry, tags]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: mode !== "idle",
    maxSize: 10 * 1024 * 1024,
  });

  const handlePaste     = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text) setDetectedAsCode(detectCode(text));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextValue(val);
    if (val.length > 30) setDetectedAsCode(detectCode(val));
  };

  const handleSubmitText = async () => {
    const content = textValue.trim();
    if (!content) return;
    const expiry = itemExpiry === 0 ? undefined : (itemExpiry as ItemExpiryOption);
    await addTextContent({
      type:            detectedAsCode ? "code" : "text",
      content,
      title:           title.trim() || undefined,
      uploaderName:    guestName || undefined,
      itemExpiryHours: expiry,
      tags,
    });
    setTextValue(""); setTitle(""); setMode("idle");
    setDetectedAsCode(false); setItemExpiry(0); setTags([]);
  };

  const handleCancel = () => {
    setMode("idle"); setTextValue(""); setTitle("");
    setDetectedAsCode(false); setItemExpiry(0); setTags([]);
  };

  const openTextMode = (forceCode = false) => {
    setMode(forceCode ? "code" : "text");
    setDetectedAsCode(forceCode);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSaveName = () => {
    setGuestName(nameInput);
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: "0.68rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "var(--color-text-muted)",
    marginBottom: "0.375rem",
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--color-bg)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p style={sectionLabel}>Posting as</p>
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-[5px] transition-all"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          <User size={14} weight="bold" style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
            placeholder="Your name\u2026"
            maxLength={100}
            className="flex-1 text-[0.85rem] font-medium bg-transparent border-none outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
        </div>
      </div>

      <div className="p-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div {...getRootProps()}
          className="rounded-[8px] py-6 px-4 text-center cursor-pointer transition-all duration-150 mb-3"
          style={{
            border: `1.5px dashed ${isDragActive ? "var(--color-brand)" : "var(--color-border)"}`,
            background: isDragActive ? "var(--color-brand-soft)" : "var(--color-surface)",
          }}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 rounded-full border-2 animate-spin"
                style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-brand)" }}
              />
              <p className="text-[0.75rem] font-medium" style={{ color: "var(--color-text-secondary)" }}>
                Uploading\u2026
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-[6px] flex items-center justify-center"
                style={{ background: isDragActive ? "var(--color-brand)" : "var(--color-surface-alt)" }}
              >
                <UploadSimple size={18} weight="bold"
                  style={{ color: isDragActive ? "#fff" : "var(--color-brand)" }}
                />
              </div>
              <p className="text-[0.85rem] font-semibold"
                style={{ color: isDragActive ? "var(--color-brand)" : "var(--color-text-primary)" }}
              >
                {isDragActive ? "Drop it!" : "Drop files here"}
              </p>
              {!isDragActive && (
                <p className="text-[0.7rem]" style={{ color: "var(--color-text-muted)" }}>
                  Images, PDFs, any file up to 10MB
                </p>
              )}
            </div>
          )}
        </div>

        {mode === "idle" ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => openTextMode(false)}
              className="btn-secondary flex items-center justify-center gap-2 py-2 text-[0.8rem]"
            >
              <TextT size={14} weight="bold" /> Text
            </button>
            <button onClick={() => openTextMode(true)}
              className="btn-secondary flex items-center justify-center gap-2 py-2 text-[0.8rem]"
            >
              <Code size={14} weight="bold" /> Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="input-field text-[0.85rem]"
            />

            {detectedAsCode && (
              <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: "rgba(0,113,227,0.08)", color: "var(--color-accent-blue)" }}
              >
                <Code size={10} weight="bold" /> Code detected
              </span>
            )}

            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={mode === "code" ? "Paste your code here\u2026" : "Type or paste text\u2026"}
              rows={6}
              className="w-full px-3 py-2 rounded-[5px] text-[0.85rem] outline-none resize-none transition-all"
              style={{
                background: detectedAsCode ? "#1A1A1A" : "var(--color-surface-alt)",
                color: detectedAsCode ? "#EAEAEA" : "var(--color-text-primary)",
                fontFamily: detectedAsCode ? "var(--font-mono)" : "var(--font-sans)",
                border: "1px solid var(--color-border)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-brand)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--color-border)")}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSubmitText}
                disabled={!textValue.trim() || isUploading}
                className="btn-primary flex-1 justify-center py-2 text-[0.85rem]"
              >
                <Plus size={14} weight="bold" /> Add
              </button>
              <button onClick={handleCancel}
                className="btn-ghost px-3 py-2"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <X size={15} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        {isCreator && (
          <div>
            <p style={sectionLabel}>Auto-delete</p>
            <AutoDeleteSelector value={itemExpiry} onChange={setItemExpiry} />
          </div>
        )}
        <div>
          <p style={sectionLabel}>Tags</p>
          <TagInput tags={tags} setTags={setTags} />
        </div>
      </div>

      {mode === "idle" && (
        <div className="px-4 py-3 flex-1">
          <p className="text-[0.75rem] text-center leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            You can also paste directly anywhere on the page
          </p>
        </div>
      )}

      <div className="p-4 mt-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
        <button onClick={() => navigate("/")}
          className="btn-ghost w-full justify-center py-2 text-[0.85rem] font-medium"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <ArrowLeft size={15} weight="bold" /> Back to home
        </button>
      </div>
    </div>
  );
}
