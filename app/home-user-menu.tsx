"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";

type HomeUserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
};

export function HomeUserMenu({ user }: HomeUserMenuProps) {
  const fallbackLabel = (user.name ?? user.email ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu do usuario"
          style={{
            width: 40,
            height: 40,
            borderRadius: "9999px",
            border: "1px solid #d4d4d8",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            background: "#f4f4f5",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar do usuario"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 14, fontWeight: 600 }}>{fallbackLabel}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          style={{
            minWidth: 220,
            background: "#ffffff",
            border: "1px solid #e4e4e7",
            borderRadius: 10,
            padding: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            display: "grid",
            gap: 4,
          }}
        >
          <div style={{ padding: "6px 8px", borderBottom: "1px solid #f4f4f5", marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{user.name ?? "Usuario"}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>{user.email ?? "-"}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link href="/user" style={{ padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}>
              Ver perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/hubrl/create"
              style={{ padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}
            >
              Criar um hubrl
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/hubrls" style={{ padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}>
              Meus hubrl&apos;s
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/user/update"
              style={{ padding: "8px 10px", borderRadius: 8, textDecoration: "none" }}
            >
              Editar usuario
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator style={{ height: 1, background: "#f4f4f5", margin: "4px 0" }} />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%",
                textAlign: "left",
                border: 0,
                background: "transparent",
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
