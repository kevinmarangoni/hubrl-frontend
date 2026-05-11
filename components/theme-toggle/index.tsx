"use client";

import { useTheme } from "@/lib/theme-context";
import type { ThemeToggleProps } from "./types";
import { themeToggleToneClass } from "./utils";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({ tone = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const toneClass = themeToggleToneClass(tone);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm transition ${toneClass}`}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
    >
      {theme === "dark" ? (
        <SunIcon className="mx-auto h-5 w-5" />
      ) : (
        <MoonIcon className="mx-auto h-5 w-5" />
      )}
    </button>
  );
}
