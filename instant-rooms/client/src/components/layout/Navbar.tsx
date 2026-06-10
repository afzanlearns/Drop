import { useState, useEffect } from "react";
import { Drop, List, X, ArrowUpRight } from "@phosphor-icons/react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "About", id: "about" },
    { name: "Features", id: "features" },
    { name: "FAQ", id: "faq" },
  ];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-panel-solid py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[5px] flex items-center justify-center"
            style={{
              background: "var(--color-brand)",
            }}
          >
            <Drop size={14} weight="fill" className="text-white" />
          </div>
          <span
            className="font-bold tracking-tight text-[1rem]"
            style={{ color: "var(--color-text-primary)" }}
          >
            Drop
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 mx-auto">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-3 py-1.5 text-[0.8125rem] font-medium rounded-[5px] transition-all duration-150"
              style={{
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--color-text-primary)";
                (e.target as HTMLElement).style.background = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "var(--color-text-secondary)";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          <a
            href="https://github.com/afzanlearns/Drop"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[0.8125rem] font-medium transition-colors duration-150"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)")}
          >
            GitHub
            <ArrowUpRight size={13} />
          </a>

          <div className="w-px h-3.5" style={{ background: "var(--color-border)" }} />
          <ThemeToggle />

          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500);
            }}
            className="btn-primary text-[0.8125rem] py-1.5 px-3.5"
          >
            Create Room
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3 ml-auto">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-[5px] transition-colors"
            style={{ color: "var(--color-text-primary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: "var(--color-bg)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[5px] flex items-center justify-center" style={{ background: "var(--color-brand)" }}>
                <Drop size={14} weight="fill" className="text-white" />
              </div>
              <span className="font-bold tracking-tight text-[1rem]" style={{ color: "var(--color-text-primary)" }}>
                Drop
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 rounded-[5px] flex items-center justify-center transition-colors"
              style={{ background: "var(--color-surface)", color: "var(--color-text-primary)" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-0.5 p-4">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-left text-lg font-medium px-3 py-3 rounded-[5px] transition-colors"
                style={{ color: "var(--color-text-primary)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-surface)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {link.name}
              </button>
            ))}

            <div className="my-3 h-px" style={{ background: "var(--color-border)" }} />

            <a
              href="https://github.com/afzanlearns/Drop"
              target="_blank"
              rel="noreferrer"
              className="text-left text-lg font-medium px-3 py-3 rounded-[5px] flex items-center gap-2 transition-colors"
              style={{ color: "var(--color-text-primary)" }}
            >
              GitHub
              <ArrowUpRight size={18} style={{ color: "var(--color-text-muted)" }} />
            </a>

            <div className="mt-3 px-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500);
                }}
                className="btn-primary w-full justify-center py-2.5"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
