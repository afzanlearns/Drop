import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full flex items-center justify-center
                 bg-surface-alt border border-border
                 hover:bg-surface-2 transition-colors duration-150
                 text-text-secondary hover:text-text-primary"
      aria-label="Toggle theme"
    >
      <span
        style={{ transition: "opacity 150ms ease" }}
        className="flex items-center justify-center"
      >
        {theme === "dark" ? (
          <Moon size={16} weight="fill" />
        ) : (
          <Sun size={16} weight="fill" />
        )}
      </span>
    </button>
  );
}
