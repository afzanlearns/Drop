import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadSimple, Code, TextT, Plus, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomStore } from "../../store/roomStore";

type InputMode = "idle" | "text" | "code";

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

export default function DropZone() {
  const { uploadFile, addTextContent, isUploading } = useRoomStore();
  const [mode, setMode] = useState<InputMode>("idle");
  const [textValue, setTextValue] = useState("");
  const [title, setTitle] = useState("");
  const [detectedAsCode, setDetectedAsCode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: mode !== "idle",
    maxSize: 10 * 1024 * 1024,
  });

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text) {
      setDetectedAsCode(detectCode(text));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTextValue(val);
    if (val.length > 30) {
      setDetectedAsCode(detectCode(val));
    }
  };

  const handleSubmitText = async () => {
    const content = textValue.trim();
    if (!content) return;
    const type = detectedAsCode ? "code" : "text";
    await addTextContent({ type, content, title: title.trim() || undefined });
    setTextValue("");
    setTitle("");
    setMode("idle");
    setDetectedAsCode(false);
  };

  const handleCancel = () => {
    setMode("idle");
    setTextValue("");
    setTitle("");
    setDetectedAsCode(false);
  };

  const openTextMode = (forceCode = false) => {
    setMode(forceCode ? "code" : "text");
    setDetectedAsCode(forceCode);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest px-1 mb-1">
        Add Content
      </div>

      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? "border-emerald-400 bg-emerald-50"
            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
          }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">Uploading...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2">
            <UploadSimple size={24} className="text-emerald-500" weight="duotone" />
            <p className="text-xs text-emerald-600 font-medium">Drop to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadSimple size={20} className="text-zinc-300" />
            <p className="text-xs text-zinc-400">
              Drop files here
              <br />
              <span className="text-zinc-300">images, PDFs, any file up to 10MB</span>
            </p>
          </div>
        )}
      </div>

      {/* Quick action buttons */}
      <AnimatePresence mode="wait">
        {mode === "idle" ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            <button
              onClick={() => openTextMode(false)}
              className="flex items-center gap-2 px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
            >
              <TextT size={15} className="text-zinc-400" />
              Text
            </button>
            <button
              onClick={() => openTextMode(true)}
              className="flex items-center gap-2 px-3 py-2.5 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
            >
              <Code size={15} className="text-zinc-400" />
              Code
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-2"
          >
            {/* Title input */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="input-field text-sm"
            />

            {/* Content detection badge */}
            {detectedAsCode && (
              <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-1 rounded-lg">
                <Code size={11} />
                Code detected
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={
                mode === "code"
                  ? "Paste your code here..."
                  : "Type or paste text..."
              }
              rows={8}
              className={`w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm outline-none resize-y
                          transition-all duration-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50
                          ${detectedAsCode ? "font-mono text-xs bg-zinc-950 text-zinc-100 border-zinc-700 focus:border-violet-500 focus:ring-violet-50" : "bg-white text-zinc-800"}`}
            />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitText}
                disabled={!textValue.trim() || isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg
                           hover:bg-zinc-800 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paste hint */}
      {mode === "idle" && (
        <p className="text-xs text-zinc-300 text-center px-2">
          You can also paste directly anywhere on the page
        </p>
      )}
    </div>
  );
}
