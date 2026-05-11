"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import { HomeUserMenu } from "@/components/home-user-menu";
import { HubrlLogo } from "@/components/hubrl-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { http } from "@/lib/http";
import type { HomeHeaderProps, HomeHeaderUserProfile } from "./types";
import {
  headerBarClass,
  headerOverlayClass,
  heroBrandClass,
  heroLinkEntrarClass,
} from "./utils";

function headerClassName(shell: string, extra?: string) {
  return extra?.trim() ? `${shell} ${extra}` : shell;
}

export function HomeHeader({ variant = "default", className }: HomeHeaderProps) {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await http.get("/api/users/me");
      if (response.status === 401) {
        const session = await getSession();
        if (session) {
          await signOut({ callbackUrl: "/login" });
          throw new Error("Sessao expirada");
        }
        throw new Error("Nao autenticado");
      }
      if (!response.ok) {
        throw new Error("Falha ao carregar usuario");
      }
      return (await response.json()) as HomeHeaderUserProfile;
    },
    retry: false,
  });

  const isOverlay = variant === "overlay";
  const shell = isOverlay ? headerOverlayClass : headerBarClass;
  const brandClass = isOverlay ? heroBrandClass : "text-lg font-bold tracking-tight text-fg";

  if (meQuery.isError) {
    return (
      <header className={headerClassName(shell, className)}>
        <Link href="/" className={`${brandClass} inline-flex items-center gap-2 no-underline`}>
          <HubrlLogo className="size-7 shrink-0 md:size-8" />
          <span>hubrl</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle tone={isOverlay ? "onImage" : "default"} />
          <Link href="/login" className={isOverlay ? heroLinkEntrarClass : "link-accent text-sm"}>
            Entrar
          </Link>
        </div>
      </header>
    );
  }

  if (meQuery.isLoading || !meQuery.data) {
    return (
      <header className={headerClassName(shell, className)}>
        <Link href="/" className={`${brandClass} inline-flex items-center gap-2 no-underline`}>
          <HubrlLogo className="size-7 shrink-0 md:size-8" />
          <span>hubrl</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle tone={isOverlay ? "onImage" : "default"} />
          <span className={`text-sm ${isOverlay ? "text-white/80 drop-shadow-sm" : "text-fg-muted"}`}>
            Carregando...
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClassName(shell, className)}>
      <Link href="/" className={`${brandClass} inline-flex items-center gap-2 no-underline`}>
        <HubrlLogo className="size-7 shrink-0 md:size-8" />
        <span>hubrl</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle tone={isOverlay ? "onImage" : "default"} />
        <HomeUserMenu
          overlayTrigger={isOverlay}
          user={{
            name: meQuery.data.name,
            email: meQuery.data.email,
            avatarUrl: meQuery.data.avatarUrl,
          }}
        />
      </div>
    </header>
  );
}
