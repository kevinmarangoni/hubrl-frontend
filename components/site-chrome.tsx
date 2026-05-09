"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type SiteChromeProps = {
  /** Se false, não renderiza o link da marca (útil quando o header já tem marca). */
  showBrand?: boolean;
};

export function SiteChrome({ showBrand = true }: SiteChromeProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
      {showBrand ? (
        <Link
          href="/"
          className="mr-auto text-lg font-bold tracking-tight text-fg transition hover:text-accent"
        >
          hubrl
        </Link>
      ) : null}
      <ThemeToggle />
    </div>
  );
}
