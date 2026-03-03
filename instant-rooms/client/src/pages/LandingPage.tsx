import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Hash,
  FileText,
  Code,
  Image,
  FilePdf,
  Lightning,
  Lock,
  Clock,
} from "@phosphor-icons/react";
import { roomApi } from "../utils/api";

const FEATURE_CARDS = [
  {
    icon: FileText,
    label: "Text & Code",
    desc: "Paste anything — auto-detects language",
  },
  {
    icon: Image,
    label: "Images",
    desc: "Drop images with instant inline preview",
  },
  {
    icon: FilePdf,
    label: "PDFs",
    desc: "Browse PDFs without leaving the room",
  },
  {
    icon: Lock,
    label: "Access Modes",
    desc: "Full, read-only, or drop-only access",
  },
  {
    icon: Clock,
    label: "Auto-expiry",
    desc: "Rooms vanish after 24h or pin forever",
  },
  {
    icon: Lightning,
    label: "No accounts",
    desc: "Share a code. Done.",
  },
];

// Animated room mock preview
function RoomMockup() {
  const items = [
    { type: "code", label: "index.ts", color: "bg-violet-100 text-violet-700" },
    { type: "text", label: "Meeting notes · 3 min ago", color: "bg-zinc-100 text-zinc-600" },
    { type: "image", label: "screenshot.png · 5 min ago", color: "bg-amber-100 text-amber-700" },
    { type: "pdf", label: "report.pdf · 12 min ago", color: "bg-red-100 text-red-700" },
    { type: "text", label: "API key (expires 24h) · now", color: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="relative w-full max-w-md ml-auto">
      {/* Browser chrome */}
      <div className="bg-zinc-800 rounded-t-2xl px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </div>
        <div className="flex-1 ml-3">
          <div className="bg-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-400 font-mono">
            instant-rooms.app/room/XK7mN2pQ
          </div>
        </div>
      </div>

      {/* Room header mockup */}
      <div className="bg-white border-x border-zinc-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={14} weight="bold" className="text-emerald-500" />
          <span className="font-mono font-semibold text-sm text-zinc-800">XK7mN2pQ</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            Full Access
          </span>
          <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
            23h left
          </span>
        </div>
      </div>

      {/* Timeline items */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-b-2xl divide-y divide-zinc-100 overflow-hidden">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-zinc-50 transition-colors"
          >
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.color}`}>
              {item.type}
            </span>
            <span className="text-xs text-zinc-500 font-mono truncate">{item.label}</span>
          </motion.div>
        ))}

        {/* Drop zone hint */}
        <div className="px-5 py-4 flex items-center gap-3 border-2 border-dashed border-zinc-200 m-3 rounded-xl bg-zinc-50/50">
          <span className="text-xs text-zinc-400">Drop files or paste content here</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError("");
    try {
      const room = await roomApi.create({ expiryHours: 24 });
      navigate(`/room/${room.code}`);
    } catch {
      setError("Could not create room. Please try again.");
      setIsCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim();
    if (!code) {
      inputRef.current?.focus();
      return;
    }
    navigate(`/room/${code}`);
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-white overflow-hidden">
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px),
                            linear-gradient(to bottom, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)" }}
      />

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Hash size={14} weight="bold" className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">instant-rooms</span>
        </div>
        <a
          href="https://github.com"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </nav>

      {/* Main content - asymmetric split */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-24 items-center">
          {/* Left: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                No account required
              </div>

              <h1 className="text-4xl md:text-[3.5rem] font-bold tracking-tighter leading-[1.05] mb-6 text-white">
                Drop anything.
                <br />
                <span className="text-zinc-400">Share instantly.</span>
              </h1>

              <p className="text-zinc-400 text-lg leading-relaxed max-w-[48ch] mb-10">
                Create a room in one click. Paste text, drop images, share PDFs.
                Anyone with the code gets in — no logins, no friction.
              </p>

              {/* Create CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="group inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-500 text-white font-semibold text-sm rounded-xl
                             transition-all duration-200 ease-out hover:bg-emerald-400 active:scale-[0.98]
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating room...
                    </>
                  ) : (
                    <>
                      Create a Room
                      <ArrowRight
                        size={16}
                        weight="bold"
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </div>

              {/* Join form */}
              <form onSubmit={handleJoin} className="flex gap-2 max-w-xs">
                <input
                  ref={inputRef}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code..."
                  className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white
                             font-mono placeholder:text-zinc-500 outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg
                             transition-colors active:scale-[0.98]"
                >
                  Join
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </motion.div>

            {/* Feature grid - 2 columns asymmetric */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6"
            >
              {FEATURE_CARDS.map((card, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <card.icon size={15} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{card.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <RoomMockup />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 mt-20 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            Rooms expire after 24 hours by default. Pin to keep forever.
          </p>
          <p className="text-xs text-zinc-700 font-mono">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
