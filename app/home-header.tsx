"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HomeUserMenu } from "./home-user-menu";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  provider: "local" | "google";
  lastLogin: string | null;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  avatarPublicId: string | null;
};

const headerBar =
  "flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 shadow-glass backdrop-blur-xl";

export function HomeHeader() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/users/me", { method: "GET" });
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
      return (await response.json()) as UserProfile;
    },
    retry: false,
  });

  if (meQuery.isError) {
    return (
      <header className={headerBar}>
        <strong className="text-lg font-bold tracking-tight text-fg">hubrl</strong>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="link-accent text-sm">
            Entrar
          </Link>
        </div>
      </header>
    );
  }

  if (meQuery.isLoading || !meQuery.data) {
    return (
      <header className={headerBar}>
        <strong className="text-lg font-bold tracking-tight text-fg">hubrl</strong>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-sm text-fg-muted">Carregando...</span>
        </div>
      </header>
    );
  }

  return (
    <header className={headerBar}>
      <strong className="text-lg font-bold tracking-tight text-fg">hubrl</strong>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <HomeUserMenu
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
