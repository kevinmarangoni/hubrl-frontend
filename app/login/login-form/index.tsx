"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import type { LoginLoadingState } from "./types";
import { mapAuthError } from "./utils";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<LoginLoadingState>(null);

  const urlError = useMemo(
    () => mapAuthError(searchParams.get("error")),
    [searchParams],
  );

  async function handleGoogleLogin() {
    setIsLoading("google");
    await signIn("google", { callbackUrl: "/user" });
  }

  async function handleDiscordLogin() {
    setIsLoading("discord");
    await signIn("discord", { callbackUrl: "/user" });
  }

  const busy = isLoading !== null;

  return (
    <div className="grid max-w-md gap-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={busy}
        className="btn-secondary w-full"
      >
        {isLoading === "google" ? "Abrindo Google…" : "Continuar com Google"}
      </button>

      <button
        type="button"
        onClick={handleDiscordLogin}
        disabled={busy}
        className="btn-secondary w-full"
      >
        {isLoading === "discord" ? "Abrindo Discord…" : "Continuar com Discord"}
      </button>

      {urlError ? <p className="m-0 text-sm text-danger">{urlError}</p> : null}
    </div>
  );
}
