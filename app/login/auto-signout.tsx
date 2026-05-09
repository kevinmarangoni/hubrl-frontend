"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export function AutoSignOut() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return <p className="m-0 text-sm text-fg-muted">Sessao invalida. Saindo...</p>;
}
