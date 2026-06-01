import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Hash, FileText, Code, Image, FilePdf, Lightning,
  Lock, Clock, Shuffle, PencilSimple, CheckCircle, XCircle,
  SpinnerGap, User, QrCode, Copy, PushPin, Warning, CaretDown, ArrowUp, ArrowUpRight,
  Columns
} from "@phosphor-icons/react";
import { roomApi } from "../utils/api";
import Navbar from "../components/layout/Navbar";

type CodeMode = "random" | "custom";
type AvailStatus = "idle" | "checking" | "available" | "taken";

const FEATURES = [
  { icon: Lightning, label: "Instant Rooms", desc: "Create a shareable room in one click. Random or custom code — your choice." },
  { icon: FileText, label: "Drop Anything", desc: "Images, PDFs, text snippets, code blocks. Any file up to 10MB." },
  { icon: Lock, label: "No Login Required", desc: "Share a code. That's it. No accounts, no emails, no passwords." },
  { icon: Lock, label: "Access Modes", desc: "Full access, read-only, or drop-only. You control who can do what." },
  { icon: Clock, label: "Auto-Expiry", desc: "Rooms vanish after 24 hours. Data is permanently wiped on expiry." },
  { icon: User, label: "Creator Controls", desc: "Only the creator can delete content or change room settings." },
  { icon: Columns, label: "Board View", desc: "Organize content by type — images, PDFs, and code in separate visual columns." }
];

const FAQS = [
  { q: "Is Instant Rooms free to use?", a: "Yes, completely free. No account, no subscription, no hidden fees." },
  { q: "How long do rooms last?", a: "Rooms expire after 24 hours by default. Creators can pin a room to keep it alive indefinitely." },
  { q: "Is my data private?", a: "Rooms are only accessible via their unique code. We don't index or display rooms publicly. Content auto-deletes on expiry." },
  { q: "What file types are supported?", a: "Images, PDFs, plain text, and code snippets. Any file up to 10MB." },
  { q: "What happens when a room expires?", a: "All content is permanently deleted. There is no recovery after expiry." }
];

/* ── Room Mockup Preview ── */
function RoomMockup() {
  const items = [
    { type: "code",  label: "index.ts",                 dot: "#6366F1" },
    { type: "text",  label: "Meeting notes · 3 min ago", dot: "#16A34A" },
    { type: "image", label: "screenshot.png · 5 min ago", dot: "#EA580C" },
  ];

  return (
    <div className="relative w-full max-w-[340px] mx-auto hidden lg:flex flex-col animate-float mt-2">
      {/* Glow backdrop */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, var(--color-brand-soft) 0%, transparent 70%)",
        }}
      />

      {/* Window card */}
      <div
        className="relative flex flex-col text-[0.8rem] overflow-hidden"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface-alt)",
          }}
        >
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div
            className="flex-1 ml-2 px-3 py-1 text-[0.65rem] rounded-md flex items-center justify-between"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <span>drop.app/room/XK7mN2pQ</span>
            <Lock size={9} weight="bold" />
          </div>
        </div>

        {/* Room header bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-1.5">
            <Hash size={13} weight="bold" style={{ color: "var(--color-text-primary)" }} />
            <span className="font-mono text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>
              XK7mN2pQ
            </span>
          </div>
          <div className="flex gap-1.5 font-mono">
            <span
              className="text-[9px] px-2 py-1 rounded-md font-bold"
              style={{
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
              }}
            >
              Full Access
            </span>
            <span
              className="text-[9px] px-2 py-1 rounded-md font-bold"
              style={{
                background: "var(--color-surface-alt)",
                color: "var(--color-text-secondary)",
              }}
            >
              23H LEFT
            </span>
          </div>
        </div>

        {/* Content list */}
        <div className="flex flex-col" style={{ background: "var(--color-bg)" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{
                borderBottom: "1px solid var(--color-border-soft)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: item.dot }}
              />
              <span
                className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--color-surface-alt)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {item.type.toUpperCase()}
              </span>
              <span
                className="text-[0.7rem] font-mono truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {item.label}
              </span>
            </div>
          ))}

          {/* Drop zone row */}
          <div
            className="mx-3 my-3 px-4 py-5 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed"
            style={{
              borderColor: "var(--color-border-strong)",
              background: "var(--color-surface-alt)",
            }}
          >
            <PushPin size={16} style={{ color: "var(--color-text-muted)" }} />
            <span
              className="text-[0.6rem] font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              Drop files or paste content
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Walkthrough Timeline ── */
function StaticWalkthrough() {
  const steps = [
    { num: "01", text: "Room created: XK7mN2pQ",          status: "done" },
    { num: "02", text: "File dropped: 'design-assets.zip'", status: "done" },
    { num: "03", text: "Link shared with team",             status: "done" },
    { num: "04", text: "Room expired. Data wiped.",          status: "expired" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Terminal bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-alt)",
        }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span
          className="font-mono text-[0.7rem]"
          style={{ color: "var(--color-text-muted)" }}
        >
          instant-rooms — activity
        </span>
      </div>

      <div className="flex flex-col gap-0 p-5">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-4 opacity-0"
            style={{ animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${i * 150}ms` }}
          >
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-black flex-shrink-0"
                style={{
                  background: step.status === "expired"
                    ? "rgba(220,38,38,0.1)"
                    : "var(--color-brand-soft)",
                  color: step.status === "expired"
                    ? "var(--color-accent-red)"
                    : "var(--color-brand)",
                }}
              >
                {step.num}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-px flex-1 mt-1 mb-1"
                  style={{
                    height: "20px",
                    background: "var(--color-border)",
                  }}
                />
              )}
            </div>
            <span
              className="text-[0.8rem] font-mono leading-[1.4] pb-4"
              style={{
                color: step.status === "expired"
                  ? "var(--color-text-muted)"
                  : "var(--color-text-primary)",
                textDecoration: step.status === "expired" ? "line-through" : "none",
              }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({
  icon: Icon,
  label,
  desc,
}: {
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <div
      className="group flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = "var(--shadow-md)";
        el.style.borderColor = "var(--color-border-strong)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.borderColor = "var(--color-border)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
        style={{
          background: "var(--color-brand-soft)",
          color: "var(--color-brand)",
        }}
      >
        <Icon size={20} weight="bold" />
      </div>
      <div>
        <h3
          className="text-[0.95rem] font-bold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {label}
        </h3>
        <p
          className="text-[0.82rem] leading-[1.6]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

/* ── Landing Page ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [codeMode, setCodeMode] = useState<CodeMode>("random");
  const [customCode, setCustomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [availStatus, setAvailStatus] = useState<AvailStatus>("idle");
  const [availMsg, setAvailMsg] = useState("");
  const [customCodeError, setCustomCodeError] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateCode = (code: string): string => {
    if (!code) return "Please enter a code.";
    if (code.length < 4) return "Code must be at least 4 characters.";
    if (code.length > 12) return "Code must be at most 12 characters.";
    if (!/^[A-Za-z0-9]+$/.test(code)) return "Only letters and numbers allowed.";
    return "";
  };

  const handleCheckAvailability = async () => {
    const normalized = customCode.trim().toUpperCase();
    const validationError = validateCode(normalized);
    if (validationError) { setCustomCodeError(validationError); return; }
    setCustomCodeError("");
    setAvailStatus("checking");
    try {
      const exists = await roomApi.checkCode(normalized);
      if (exists) {
        setAvailStatus("taken");
        setAvailMsg(`"${normalized}" is already taken.`);
      } else {
        setAvailStatus("available");
        setAvailMsg(`"${normalized}" is available!`);
      }
    } catch {
      setAvailStatus("idle");
      setAvailMsg("Could not check. Please try again.");
    }
  };

  const handleCreate = async () => {
    setError(null);
    if (codeMode === "custom") {
      const normalized = customCode.trim().toUpperCase();
      const validationError = validateCode(normalized);
      if (validationError) { setCustomCodeError(validationError); return; }
      setCustomCodeError("");
    }
    setIsCreating(true);
    try {
      const { room, creatorToken } = await roomApi.create({
        expiryHours: 24,
        name: roomName.trim() || undefined,
        customCode: codeMode === "custom" ? customCode.trim().toUpperCase() : undefined,
      });
      localStorage.setItem(`creator_${room.code.toUpperCase()}`, creatorToken);
      navigate(`/room/${room.code}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : undefined;
      setError(msg ?? "Could not create room. Please try again.");
      setIsCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) { inputRef.current?.focus(); return; }
    navigate(`/room/${code}`);
  };

  const handleCustomCodeChange = (val: string) => {
    setCustomCode(val.toUpperCase().replace(/[^A-Za-z0-9]/g, ""));
    setAvailStatus("idle");
    setAvailMsg("");
    setCustomCodeError("");
  };

  return (
    <div
      className="min-h-[100dvh] overflow-x-hidden"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[70vh] flex items-center px-6 md:px-12 pt-28 md:pt-36 pb-16"
        style={{ background: "var(--color-bg)" }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden
        >
          <div
            className="absolute top-[-10%] left-[30%] w-[600px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(177,116,87,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center relative z-10">
          {/* Left — hero text + CTA */}
          <div className="max-w-[520px]">
            {/* Version badge */}
            <div
              className="inline-flex items-center gap-2 text-[0.72rem] font-semibold rounded-full px-3 py-1.5 mb-6"
              style={{
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                border: "1px solid rgba(177,116,87,0.20)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-brand)", animation: "pulse-glow 2s infinite" }}
              />
              v2.0 — Board view & custom codes
              <ArrowRight size={12} weight="bold" />
            </div>

            <h1
              className="text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight leading-[1.05] mb-5"
            >
              <span style={{ color: "var(--color-text-primary)" }}>Drop anything. </span>
              <span style={{ color: "var(--color-text-muted)" }}>Share instantly.</span>
            </h1>

            <p
              className="text-[0.95rem] leading-[1.7] mb-8 max-w-[420px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Create a room in one click. Paste text, drop images, share PDFs.
              No logins, no friction — just pure utility.
            </p>

            {/* CTA Card */}
            <div
              className="rounded-2xl p-5 max-w-[440px]"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Room name */}
              <div className="mb-4">
                <input
                  value={roomName}
                  onChange={(e) => { setRoomName(e.target.value); setError(null); }}
                  placeholder="Room name (optional)"
                  maxLength={100}
                  className="input-field"
                />
              </div>

              {/* Mode toggle */}
              <div className="segment-control w-full mb-4">
                <button
                  onClick={() => { setCodeMode("random"); setAvailStatus("idle"); setAvailMsg(""); setCustomCodeError(""); }}
                  className={`segment-btn flex-1 justify-center ${codeMode === "random" ? "active" : ""}`}
                >
                  <Shuffle size={14} weight="bold" />
                  Random
                </button>
                <button
                  onClick={() => setCodeMode("custom")}
                  className={`segment-btn flex-1 justify-center ${codeMode === "custom" ? "active" : ""}`}
                >
                  <PencilSimple size={14} weight="bold" />
                  Custom
                </button>
              </div>

              {/* Custom code row */}
              {codeMode === "custom" && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        value={customCode}
                        onChange={(e) => { handleCustomCodeChange(e.target.value); setError(null); }}
                        placeholder="e.g. PROJECT_X"
                        maxLength={12}
                        className="input-field uppercase font-mono font-bold"
                      />
                      {availStatus === "available" && (
                        <CheckCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--color-accent-green)" }}
                          weight="fill"
                        />
                      )}
                      {availStatus === "taken" && (
                        <XCircle
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--color-accent-red)" }}
                          weight="fill"
                        />
                      )}
                    </div>
                    <button
                      onClick={handleCheckAvailability}
                      disabled={availStatus === "checking" || !customCode}
                      className="btn-secondary px-4 py-2 text-[0.8rem]"
                    >
                      {availStatus === "checking" ? "..." : "Check"}
                    </button>
                  </div>
                  {customCodeError && (
                    <p className="mt-2 text-xs" style={{ color: "var(--color-accent-red)" }}>
                      {customCodeError}
                    </p>
                  )}
                  {availMsg && !customCodeError && (
                    <p
                      className="mt-2 text-xs font-semibold"
                      style={{
                        color: availStatus === "available"
                          ? "var(--color-accent-green)"
                          : "var(--color-accent-red)",
                      }}
                    >
                      {availMsg}
                    </p>
                  )}
                </div>
              )}

              {/* Create button */}
              <button
                id="create-room-btn"
                onClick={handleCreate}
                disabled={isCreating || (codeMode === "custom" && availStatus === "taken")}
                className="btn-primary w-full justify-center py-3 text-[0.875rem]"
              >
                {isCreating ? (
                  <>
                    <SpinnerGap size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Room
                    <ArrowRight size={16} weight="bold" />
                  </>
                )}
              </button>

              {error && (
                <p
                  className="mt-3 text-[0.8rem] text-center font-medium"
                  style={{ color: "var(--color-accent-red)" }}
                >
                  {error}
                </p>
              )}

              {/* Join separator */}
              <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span
                  className="text-[0.72rem] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Already have a code?
                </span>
                <form onSubmit={handleJoin} className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter code"
                    className="input-field flex-1 uppercase font-mono"
                  />
                  <button type="submit" className="btn-secondary px-4 py-2 text-[0.8rem] font-semibold">
                    Join
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right — mockup */}
          <RoomMockup />
        </div>
      </section>

      {/* ── About ── */}
      <section
        id="about"
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 text-[0.72rem] font-semibold rounded-full px-3 py-1.5 mb-5"
              style={{
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
              }}
            >
              <Hash size={12} weight="bold" /> About
            </div>

            <h2
              className="text-[clamp(1.6rem,3vw,2.6rem)] font-black tracking-tight leading-[1.1] mb-4"
            >
              Built for speed.<br />Designed for simplicity.
            </h2>

            <p
              className="text-[0.9rem] md:text-[0.95rem] leading-[1.7] mb-8 max-w-lg"
              style={{ color: "var(--color-text-secondary)" }}
            >
              We built Drop because sharing a quick script or a few images between devices
              shouldn't require accounts or setups. Create, drop, share, and disappear.
              Everything vanishes when you're done.
            </p>

            {/* Stats grid */}
            <div
              className="grid grid-cols-3 rounded-2xl overflow-hidden"
              style={{
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
              }}
            >
              {[
                { icon: Lightning, label: "Instant",    desc: "Ready in one click. No waiting." },
                { icon: Lock,      label: "Private",     desc: "No accounts. 100% anonymous." },
                { icon: Clock,     label: "Ephemeral",   desc: "Auto-expiry leaves no trace." },
              ].map(({ icon: Icon, label, desc }, i) => (
                <div
                  key={i}
                  className="p-4"
                  style={{
                    borderRight: i < 2 ? "1px solid var(--color-border)" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                    style={{
                      background: "var(--color-brand-soft)",
                      color: "var(--color-brand)",
                    }}
                  >
                    <Icon size={16} weight="bold" />
                  </div>
                  <h3
                    className="text-[0.85rem] font-bold tracking-tight mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {label}
                  </h3>
                  <p
                    className="text-[0.75rem] leading-[1.6]"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <StaticWalkthrough />
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-bg)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-[0.72rem] font-semibold rounded-full px-3 py-1.5 mb-4"
              style={{
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
              }}
            >
              <Hash size={12} weight="bold" /> Features
            </div>
            <h2
              className="text-[clamp(1.6rem,3vw,2.6rem)] font-black tracking-tight leading-[1.1] mb-3"
            >
              Everything you need.
            </h2>
            <p
              className="text-[0.9rem] md:text-[0.95rem] max-w-md mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Fast, efficient, and beautifully minimal.
            </p>
          </div>

          {/* Hero feature card */}
          <div
            className="rounded-2xl p-7 md:p-10 flex flex-col md:flex-row gap-8 items-start mb-6"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  background: "var(--color-brand)",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                <Lightning size={22} className="text-white" weight="bold" />
              </div>
              <h3
                className="text-[1.3rem] font-black tracking-tight mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Instant Rooms
              </h3>
              <p
                className="text-[0.9rem] leading-[1.7] max-w-md mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Create a shareable room in one click. Random or custom code — your choice.
                No friction, just pure utility when you need to move data fast.
              </p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500);
                }}
                className="btn-primary"
              >
                Create Room Now
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>

            {/* Code preview */}
            <div
              className="flex-1 w-full hidden sm:block rounded-xl overflow-hidden"
              style={{
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span
                  className="text-[0.7rem] font-mono"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  room.ts
                </span>
              </div>
              <div
                className="p-5 font-mono text-[0.75rem] leading-[2]"
                style={{ color: "var(--color-text-primary)" }}
              >
                <div style={{ color: "var(--color-text-muted)" }}>// Create a room</div>
                <div>
                  <span style={{ color: "#818CF8" }}>const</span> room ={" "}
                  <span style={{ color: "#818CF8" }}>await</span>
                </div>
                <div className="pl-4">
                  <span style={{ color: "var(--color-brand)" }}>createRoom</span>
                  {"({"}
                </div>
                <div className="pl-8">
                  code: <span style={{ color: "#FB923C" }}>'MY-ROOM'</span>,
                </div>
                <div className="pl-8">
                  access: <span style={{ color: "#FB923C" }}>'full'</span>
                </div>
                <div className="pl-4">{"});"}</div>
                <div className="mt-2" style={{ color: "var(--color-text-muted)" }}>
                  // Share the link
                </div>
                <div>
                  <span style={{ color: "var(--color-brand)" }}>share</span>(room.url);
                </div>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.slice(1).map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="px-6 md:px-12 py-16 md:py-24"
        style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-[0.72rem] font-semibold rounded-full px-3 py-1.5 mb-4"
              style={{
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
              }}
            >
              <Hash size={12} weight="bold" /> FAQ
            </div>
            <h2
              className="text-[clamp(1.6rem,3vw,2.6rem)] font-black tracking-tight leading-[1.1]"
            >
              Common questions.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "var(--color-bg)",
                    border: `1px solid ${isOpen ? "var(--color-brand)" : "var(--color-border)"}`,
                    boxShadow: isOpen ? "var(--shadow-sm)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors duration-200"
                    style={{
                      background: isOpen ? "var(--color-brand-soft)" : "transparent",
                    }}
                  >
                    <span
                      className="font-semibold text-[0.9rem] tracking-tight pr-4"
                      style={{
                        color: isOpen ? "var(--color-brand)" : "var(--color-text-primary)",
                      }}
                    >
                      {faq.q}
                    </span>
                    <CaretDown
                      size={16}
                      weight="bold"
                      className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: isOpen ? "var(--color-brand)" : "var(--color-text-muted)" }}
                    />
                  </button>
                  <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                    <div
                      className="px-5 pb-5 text-[0.875rem] leading-[1.7]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="footer-shimmer-border relative overflow-hidden"
        style={{
          background: "var(--color-surface-alt)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {/* Giant emerging DROP text */}
        <div className="absolute inset-0 flex justify-center items-end pointer-events-none select-none z-0 mix-blend-overlay">
          <span 
            className="font-black text-[28vw] md:text-[22vw] leading-[0.7] tracking-tighter"
            style={{ 
              color: "var(--color-text-primary)",
              opacity: "0.03",
              transform: "translateY(12%)"
            }}
          >
            DROP
          </span>
        </div>

        <div className="relative z-10 py-12 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--color-brand)",
                  boxShadow: "var(--shadow-brand)",
                }}
              >
                <Hash size={18} className="text-white" weight="bold" />
              </div>
              <span
                className="font-black text-[1.2rem] tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                Drop
              </span>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {["about", "features", "faq"].map((id) => (
                <button
                  key={id}
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                  className="text-[0.8rem] font-medium capitalize transition-colors duration-200"
                  style={{ color: "var(--color-text-secondary)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)")}
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
              <a
                href="https://github.com/afzanlearns/Drop"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[0.8rem] font-medium transition-colors duration-200"
                style={{ color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)")}
              >
                GitHub <ArrowUpRight size={13} />
              </a>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500);
              }}
              className="btn-primary px-6 py-3"
            >
              Create a Room
              <ArrowRight size={16} weight="bold" />
            </button>

            <p
              className="text-[0.72rem] font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              © {new Date().getFullYear()} Drop. Share with intention.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: "var(--color-brand)",
            boxShadow: "var(--shadow-brand)",
            color: "#fff",
          }}
          aria-label="Back to top"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-brand)";
          }}
        >
          <ArrowUp size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}
