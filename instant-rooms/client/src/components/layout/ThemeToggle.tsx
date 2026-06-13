import { useTheme } from "../../hooks/useTheme";

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 1V2.5M7 11.5V13M13 7H11.5M2.5 7H1M11.2 2.8L10.1 3.9M3.9 10.1L2.8 11.2M11.2 11.2L10.1 10.1M3.9 3.9L2.8 2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 8.5C10.5 9.5 9 10 7.5 9.5C6 9 5 7.5 5.5 5.5C5.8 4.5 6.5 3.5 7.5 3C6 3 4.5 3.5 3.5 4.5C2 6 2 8.5 3.5 10C5 11.5 7.5 12 9.5 11C10.5 10.5 11 9.5 11.5 8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 font-mono text-label px-2.5 py-1.5 transition-all duration-150"
      style={{ color: 'var(--text-secondary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
