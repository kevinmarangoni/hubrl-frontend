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

const itemClass =
  "block w-full rounded-lg px-2.5 py-2 text-sm text-fg no-underline outline-none transition hover:bg-accent-muted/40 focus:bg-accent-muted/40";

export function HomeUserMenu({ user }: HomeUserMenuProps) {
  const fallbackLabel = (user.name ?? user.email ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu do usuario"
          className="grid size-10 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-border-strong bg-surface/80 p-0 shadow-sm backdrop-blur-sm transition hover:border-accent/50 hover:ring-2 hover:ring-accent/20"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar do usuario" className="size-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-accent">{fallbackLabel}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 grid min-w-[220px] gap-0.5 rounded-xl border border-border/80 bg-surface-elevated/95 p-1.5 shadow-glass backdrop-blur-xl"
        >
          <div className="mb-1 border-b border-border/60 px-2 py-2">
            <p className="m-0 text-sm font-semibold text-fg">{user.name ?? "Usuario"}</p>
            <p className="m-0 truncate text-xs text-fg-muted">{user.email ?? "-"}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link href="/user" className={itemClass}>
              Ver perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/hubrl/create" className={itemClass}>
              Criar um hubrl
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/hubrls" className={itemClass}>
              Meus hubrl&apos;s
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/user/update" className={itemClass}>
              Editar usuario
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border/80" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full cursor-pointer rounded-lg border-0 bg-transparent px-2.5 py-2 text-left text-sm text-danger outline-none transition hover:bg-danger/10"
            >
              Sair
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
