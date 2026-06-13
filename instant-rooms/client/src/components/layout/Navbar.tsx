import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

function DropLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="18" height="18" rx="2" stroke="var(--accent)" strokeWidth="1.5"/>
      <path d="M6 11L11 6L16 11" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 6V16" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1C3.68 1 1 3.68 1 7C1 9.85 2.86 12.31 5.5 13.15C5.82 13.21 5.93 13.02 5.93 12.86V11.63C3.91 12.14 3.5 10.94 3.5 10.94C3.2 10.07 2.74 9.81 2.74 9.81C2.11 9.31 2.79 9.32 2.79 9.32C3.48 9.37 3.84 10.04 3.84 10.04C4.44 11.07 5.42 10.72 5.94 10.56C6 10.25 6.15 10.03 6.32 9.89C4.89 9.73 3.39 9.19 3.39 6.83C3.39 6.15 3.64 5.6 4.06 5.17C3.99 5 3.77 4.37 4.14 3.54C4.14 3.54 4.66 3.37 5.93 4.15C6.43 4 6.97 3.92 7.5 3.92C8.03 3.92 8.57 4 9.07 4.15C10.34 3.37 10.86 3.54 10.86 3.54C11.23 4.37 11.01 5 10.94 5.17C11.36 5.6 11.61 6.15 11.61 6.83C11.61 9.2 10.1 9.73 8.66 9.88C8.88 10.07 9.07 10.43 9.07 11V12.86C9.07 13.03 9.18 13.22 9.51 13.15C12.14 12.31 14 9.85 14 7C14 3.68 11.32 1 7 1Z" fill="currentColor"/>
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 4V8M4 6H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className="fixed top-0 inset-x-0 z-50"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', height: 44 }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-full flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="transition-transform duration-200 group-hover:scale-110" style={{ display: 'flex' }}>
            <DropLogo />
          </span>
          <span className="font-mono text-xs tracking-widest transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>Drop</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)}
              className="font-mono text-label px-3 py-1.5 transition-all duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://github.com/afzanlearns/Drop" target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-label px-2.5 py-1.5 transition-all duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <GitHubIcon /> GitHub
          </a>
          <ThemeToggle />
          <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500); }}
            className="btn-primary flex items-center gap-1.5 transition-all duration-150 hover:scale-[1.02]"
            style={{ minHeight: 30, padding: '0.25rem 0.75rem', fontSize: '0.625rem' }}
          >
            <CreateIcon /> Create Room
          </button>
        </div>

        <button className="md:hidden font-mono text-label px-2 py-1.5 transition-colors duration-150"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
          onClick={() => setMobileMenuOpen(true)}
        >
          Menu
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'var(--bg-base)' }}>
          <div className="h-11 px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <DropLogo />
              <span className="font-mono text-xs tracking-widest" style={{ color: 'var(--text-primary)' }}>Drop</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-label px-2 py-1.5 transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Close
            </button>
          </div>
          <div className="flex flex-col gap-1 p-4">
            {links.map((link) => (
              <button key={link.id} onClick={() => scrollTo(link.id)}
                className="font-mono text-sm tracking-wider text-left px-3 py-3 transition-colors duration-150"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {link.name}
              </button>
            ))}
            <a href="https://github.com/afzanlearns/Drop" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 font-mono text-sm tracking-wider px-3 py-3 transition-colors duration-150"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <GitHubIcon /> GitHub
            </a>
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            <div className="px-3 mt-2">
              <button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => document.getElementById("create-room-btn")?.focus(), 500); }}
                className="btn-primary w-full flex items-center justify-center gap-1.5"
              >
                <CreateIcon /> Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
