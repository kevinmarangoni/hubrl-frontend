"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { HomeUserMenuProps } from "./types";
import { dropdownItemClass, triggerDefaultClass, triggerOverlayClass } from "./utils";

export function HomeUserMenu({ user, overlayTrigger }: HomeUserMenuProps) {
  const fallbackLabel = (user.name ?? user.email ?? "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu do usuario"
          className={overlayTrigger ? triggerOverlayClass : triggerDefaultClass}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar do usuario" className="size-full object-cover" />
          ) : (
            <span
              className={`text-sm font-semibold ${overlayTrigger ? "text-white" : "text-accent"}`}
            >
              {fallbackLabel}
            </span>
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
            <Link href="/user" className={dropdownItemClass}>
              Ver perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/hubrl/create" className={dropdownItemClass}>
              Criar um hubrl
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/user" className={dropdownItemClass}>
              Painel
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/user/update" className={dropdownItemClass}>
              Editar perfil
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
