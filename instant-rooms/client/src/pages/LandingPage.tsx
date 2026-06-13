import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { roomApi } from "../utils/api";
import Navbar from "../components/layout/Navbar";

type CodeMode = "random" | "custom";
type AvailStatus = "idle" | "checking" | "available" | "taken";

const FEATURES = [
  { label: "Instant Rooms", desc: "Create a shareable room in one click. Random or custom code — your choice." },
  { label: "Drop Anything", desc: "Images, PDFs, text snippets, code blocks. Any file up to 10MB." },
  { label: "No Login Required", desc: "Share a code. That's it. No accounts, no emails, no passwords." },
  { label: "Access Modes", desc: "Full access, read-only, or drop-only. You control who can do what." },
  { label: "Auto-Expiry", desc: "Rooms vanish after 24 hours. Data is permanently wiped on expiry." },
  { label: "Creator Controls", desc: "Only the creator can delete content or change room settings." },
  { label: "Board View", desc: "Organize content by type — images, PDFs, and code in separate visual columns." },
];

const FAQS = [
  { q: "Is Instant Rooms free to use?", a: "Yes, completely free. No account, no subscription, no hidden fees." },
  { q: "How long do rooms last?", a: "Rooms expire after 24 hours by default. Creators can pin a room to keep it alive indefinitely." },
  { q: "Is my data private?", a: "Rooms are only accessible via their unique code. We don't index or display rooms publicly. Content auto-deletes on expiry." },
  { q: "What file types are supported?", a: "Images, PDFs, plain text, and code snippets. Any file up to 10MB." },
  { q: "What happens when a room expires?", a: "All content is permanently deleted. There is no recovery after expiry." },
];

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
      if (exists) { setAvailStatus("taken"); setAvailMsg(`"${normalized}" is already taken.`); }
      else { setAvailStatus("available"); setAvailMsg(`"${normalized}" is available!`); }
    } catch { setAvailStatus("idle"); setAvailMsg("Could not check. Please try again."); }
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
      const msg = err && typeof err === "object" && "response" in err
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
    setAvailStatus("idle"); setAvailMsg(""); setCustomCodeError("");
  };

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* Hero */}
      <section className="lg:min-h-screen flex items-center px-6 md:px-12 pt-12 lg:pt-14 pb-16 lg:pb-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div className="max-w-[520px]">
            <h1 className="font-mono font-semibold leading-[1.05] mb-5" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--text-primary)' }}>
              Drop anything.
              <br /><span style={{ color: 'var(--text-secondary)' }}>Share instantly.</span>
            </h1>
            <p className="text-body mb-8 max-w-[420px]" style={{ color: 'var(--text-secondary)' }}>
              Create a room in one click. Paste text, drop images, share PDFs. No logins, no friction — just pure utility.
            </p>

            <div className="p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', maxWidth: 440 }}>
              <div className="mb-3">
                <input value={roomName} onChange={(e) => { setRoomName(e.target.value); setError(null); }}
                  placeholder="Room name (optional)" maxLength={100} className="input-field" />
              </div>

              <div className="segment-control w-full mb-3">
                <button onClick={() => { setCodeMode("random"); setAvailStatus("idle"); setAvailMsg(""); setCustomCodeError(""); }}
                  className={`segment-btn flex-1 ${codeMode === "random" ? "active" : ""}`}>Random</button>
                <button onClick={() => setCodeMode("custom")}
                  className={`segment-btn flex-1 ${codeMode === "custom" ? "active" : ""}`}>Custom</button>
              </div>

              {codeMode === "custom" && (
                <div className="mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input value={customCode} onChange={(e) => { handleCustomCodeChange(e.target.value); setError(null); }}
                        placeholder="e.g. PROJECT_X" maxLength={12} className="input-field uppercase font-mono font-medium" />
                      {availStatus === "available" && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: 'var(--success)' }}>✓</span>}
                      {availStatus === "taken" && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: 'var(--error)' }}>✗</span>}
                    </div>
                    <button onClick={handleCheckAvailability} disabled={availStatus === "checking" || !customCode} className="btn-secondary">
                      {availStatus === "checking" ? "..." : "Check"}
                    </button>
                  </div>
                  {customCodeError && <p className="mt-1.5 font-mono text-xs" style={{ color: 'var(--error)' }}>{customCodeError}</p>}
                  {availMsg && !customCodeError && (
                    <p className="mt-1.5 font-mono text-xs" style={{ color: availStatus === "available" ? 'var(--success)' : 'var(--error)' }}>{availMsg}</p>
                  )}
                </div>
              )}

              <button id="create-room-btn" onClick={handleCreate}
                disabled={isCreating || (codeMode === "custom" && availStatus === "taken")}
                className="btn-primary w-full">{isCreating ? "Creating..." : "Create Room"}</button>

              {error && <p className="mt-2 font-mono text-xs text-center" style={{ color: 'var(--error)' }}>{error}</p>}

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="font-mono text-label uppercase mb-3" style={{ color: 'var(--text-muted)' }}>Already have a code?</p>
                <form onSubmit={handleJoin} className="flex gap-2">
                  <input ref={inputRef} value={roomCode} onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter code" className="input-field flex-1 uppercase" />
                  <button type="submit" className="btn-secondary">Join</button>
                </form>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col">
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-data" style={{ color: 'var(--text-secondary)' }}>drop.app/room/XK7mN2pQ</span>
                <span className="font-mono text-label" style={{ color: 'var(--accent)' }}>FULL ACCESS</span>
              </div>
              {[
                { tag: "CODE", color: 'var(--accent)', text: "index.ts" },
                { tag: "TEXT", color: 'var(--success)', text: "Meeting notes · 3 min ago" },
                { tag: "IMAGE", color: 'var(--warning)', text: "screenshot.png · 5 min ago" },
              ].map(({ tag, color, text }) => (
                <div key={tag} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="font-mono text-label" style={{ color }}>{tag}</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{text}</span>
                </div>
              ))}
              <div className="mx-3 my-3 px-4 py-6 flex items-center justify-center" style={{ border: '1px dashed var(--border-default)', background: 'var(--bg-elevated)' }}>
                <span className="font-mono text-label" style={{ color: 'var(--text-muted)' }}>Drop files or paste content</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="lg:min-h-screen flex items-center px-6 md:px-12 py-16 lg:py-0"
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 items-center">
          <div>
            <p className="font-mono text-label uppercase mb-4" style={{ color: 'var(--accent)' }}>About</p>
            <h2 className="font-mono font-semibold leading-[1.1] mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              Built for speed.<br />Designed for simplicity.
            </h2>
            <p className="text-body mb-8 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
              We built Drop because sharing a quick script or a few images between devices shouldn't require accounts or setups. Create, drop, share, and disappear. Everything vanishes when you're done.
            </p>
            <div className="grid grid-cols-3" style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              {[
                { label: "Instant", desc: "Ready in one click. No waiting." },
                { label: "Private", desc: "No accounts. 100% anonymous." },
                { label: "Ephemeral", desc: "Auto-expiry leaves no trace." },
              ].map(({ label, desc }, i) => (
                <div key={label} className="p-4" style={i < 2 ? { borderRight: '1px solid var(--border-subtle)' } : {}}>
                  <p className="font-mono text-label uppercase mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <span className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>instant-rooms — activity</span>
            </div>
            <div className="p-5">
              {[
                { num: "01", text: "Room created: XK7mN2pQ", expired: false },
                { num: "02", text: "File dropped: 'design-assets.zip'", expired: false },
                { num: "03", text: "Link shared with team", expired: false },
                { num: "04", text: "Room expired. Data wiped.", expired: true },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 pb-3" style={i < 3 ? { borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.75rem' } : {}}>
                  <span className="font-mono text-label flex-shrink-0" style={{ color: step.expired ? 'var(--error)' : 'var(--accent)', width: 24 }}>
                    {step.num}
                  </span>
                  <span className="font-mono text-xs leading-[1.4]" style={{
                    color: step.expired ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: step.expired ? 'line-through' : 'none',
                  }}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="lg:min-h-screen flex items-center px-6 md:px-12 py-16 lg:py-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <p className="font-mono text-label uppercase mb-4" style={{ color: 'var(--accent)' }}>Features</p>
            <h2 className="font-mono font-semibold leading-[1.1] mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Everything you need.</h2>
            <p className="text-body max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Fast, efficient, and beautifully minimal.</p>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start mb-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex-1">
              <p className="font-mono text-label uppercase mb-3" style={{ color: 'var(--accent)' }}>Instant Rooms</p>
              <h3 className="font-mono font-medium mb-2" style={{ fontSize: '1.25rem' }}>Instant Rooms</h3>
              <p className="text-body max-w-md mb-5" style={{ color: 'var(--text-secondary)' }}>
                Create a shareable room in one click. Random or custom code — your choice. No friction, just pure utility when you need to move data fast.
              </p>
              <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500); }}
                className="btn-primary">Create Room Now</button>
            </div>
            <div className="flex-1 w-full hidden sm:block p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono text-xs leading-[2]" style={{ color: 'var(--text-primary)' }}>
                <div style={{ color: 'var(--text-muted)' }}>// Create a room</div>
                <div><span style={{ color: '#A78BFA' }}>const</span> room = <span style={{ color: '#A78BFA' }}>await</span></div>
                <div className="pl-4"><span style={{ color: 'var(--accent)' }}>createRoom</span>{"({"}</div>
                <div className="pl-8">code: <span style={{ color: '#FB923C' }}>'MY-ROOM'</span>,</div>
                <div className="pl-8">access: <span style={{ color: '#FB923C' }}>'full'</span></div>
                <div className="pl-4">{"});"}</div>
                <div className="mt-1" style={{ color: 'var(--text-muted)' }}>// Share the link</div>
                <div><span style={{ color: 'var(--accent)' }}>share</span>(room.url);</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.slice(1).map((feature, i) => (
              <div key={i} className="p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <p className="font-mono text-label uppercase mb-1" style={{ color: 'var(--accent)' }}>{feature.label}</p>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="lg:min-h-screen flex items-center px-6 md:px-12 py-16 lg:py-0"
        style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
      >
        <div className="max-w-[660px] mx-auto w-full">
          <div className="text-center mb-10">
            <p className="font-mono text-label uppercase mb-4" style={{ color: 'var(--accent)' }}>FAQ</p>
            <h2 className="font-mono font-semibold leading-[1.1]" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>Common questions.</h2>
          </div>
          <div className="flex flex-col gap-2">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} style={{ background: 'var(--bg-base)', border: '1px solid ' + (isOpen ? 'var(--accent)' : 'var(--border-subtle)') }}>
                  <button onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left"
                    style={{ background: isOpen ? 'var(--accent-dim)' : 'transparent' }}
                  >
                    <span className="font-mono text-sm pr-4" style={{ color: isOpen ? 'var(--accent)' : 'var(--text-primary)' }}>{faq.q}</span>
                    <span className="font-mono text-label flex-shrink-0" style={{ color: isOpen ? 'var(--accent)' : 'var(--text-muted)' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className={`faq-answer ${isOpen ? "open" : ""}`}>
                    <div className="px-4 pb-4 text-body" style={{ color: 'var(--text-secondary)' }}>{faq.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div className="relative flex items-center justify-center py-24 md:py-32">
          {/* Glow behind */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="w-[600px] h-[300px]" style={{
              background: 'radial-gradient(ellipse at center, var(--accent-dim) 0%, transparent 70%)',
              opacity: 0.6,
            }} />
          </div>
          {/* Big DROP text */}
          <div className="relative z-10 text-center">
            <span className="font-mono font-black leading-none select-none"
              style={{
                fontSize: 'clamp(5rem, 20vw, 14rem)',
                color: 'transparent',
                background: 'linear-gradient(180deg, var(--text-primary) 20%, var(--text-muted) 60%, transparent 90%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                letterSpacing: '-0.04em',
              }}
            >
              DROP
            </span>
          </div>
          {/* Footer links */}
          <div className="absolute bottom-8 left-0 right-0 px-6 md:px-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-mono text-data" style={{ color: 'var(--text-muted)' }}>
                &copy; {new Date().getFullYear()} Drop. Share with intention.
              </p>
              <div className="flex items-center gap-5">
                {["about", "features", "faq"].map((id) => (
                  <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                    className="font-mono text-label uppercase" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {id}
                  </button>
                ))}
                <a href="https://github.com/afzanlearns/Drop" target="_blank" rel="noreferrer"
                  className="font-mono text-label uppercase" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
