"use client";

import { HomeHeader } from "@/components/home-header";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteChromeProps } from "./types";

/**
 * Barra superior das páginas internas: mesmo padrão visual e de sessão que a home
 * (`HomeHeader` em modo barra), com margem inferior para o conteúdo.
 */
export function SiteChrome({ showBrand = true }: SiteChromeProps) {
  if (!showBrand) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <ThemeToggle />
      </div>
    );
  }

  return <HomeHeader variant="default" className="mb-6" />;
}
