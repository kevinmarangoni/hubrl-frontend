"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
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

export function HomeHeader() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/users/me", { method: "GET" });
      if (!response.ok) {
        throw new Error("Falha ao carregar usuario");
      }
      return (await response.json()) as UserProfile;
    },
    retry: false,
  });

  if (meQuery.isError) {
    return (
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong>hubler</strong>
        <Link href="/login">Entrar</Link>
      </header>
    );
  }

  if (meQuery.isLoading || !meQuery.data) {
    return (
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <strong>hubler</strong>
        <span style={{ fontSize: 12, color: "#71717a" }}>Carregando...</span>
      </header>
    );
  }

  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <strong>hubler</strong>
      <HomeUserMenu
        user={{
          name: meQuery.data.name,
          email: meQuery.data.email,
          avatarUrl: meQuery.data.avatarUrl,
        }}
      />
    </header>
  );
}
