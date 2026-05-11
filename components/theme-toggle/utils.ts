import type { ThemeToggleProps } from "./types";

export function themeToggleToneClass(tone: ThemeToggleProps["tone"]): string {
  return tone === "onImage"
    ? "border-white/35 bg-black/25 text-white shadow-none backdrop-blur-md hover:border-white/55 hover:bg-white/15 hover:text-white"
    : "border-border/70 bg-surface/50 text-fg-muted shadow-sm dark:bg-surface/40 hover:border-accent/40 hover:bg-accent-muted/30 hover:text-accent";
}
