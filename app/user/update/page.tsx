import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";
import { EditProfileForm } from "./edit-profile-form";
import type { UpdateUserMeResponse } from "./types";

export default async function UpdateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const meResponse = await backend.get("users/me", session.backendAccessToken, { cache: "no-store" });

  if (!meResponse.ok) {
    redirect("/login");
  }

  const me = (await meResponse.json()) as UpdateUserMeResponse;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <SiteChrome />

      <div className="mb-8">
        <Link
          href="/user"
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted no-underline transition hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Voltar ao painel
        </Link>
      </div>

      <header className="mb-8">
        <p className="m-0 flex items-center gap-2 text-sm font-medium text-accent">
          <UserRound className="h-4 w-4 shrink-0" aria-hidden />
          Conta
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">Editar perfil</h1>
        <p className="m-0 mt-2 max-w-xl text-pretty text-fg-muted">
          O nome e a foto aparecem no painel, nos hubrls e onde o hubrl usar o seu perfil.
        </p>
      </header>

      <div className="glass-panel p-8 md:p-10">
        <EditProfileForm
          initialName={me.name ?? ""}
          initialEmail={me.email ?? ""}
          initialAvatarUrl={me.avatarUrl}
          userId={session.user.id}
        />
      </div>
    </main>
  );
}
