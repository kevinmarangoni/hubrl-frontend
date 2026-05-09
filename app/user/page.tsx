import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "../logout-button";

type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  provider: "local" | "google";
  lastLogin: string | null;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  avatarPublicId: string | null;
};

const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const response = await fetch(`${backendBaseUrl}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.backendAccessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  const user = (await response.json()) as UserProfileResponse;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <SiteChrome />
      <div className="glass-panel p-8">
        <h1 className="mt-0 text-2xl font-bold text-fg">Perfil</h1>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar do usuario"
              className="size-[72px] shrink-0 rounded-full border border-border object-cover shadow-glow"
            />
          ) : null}
          <dl className="grid flex-1 gap-2 text-sm">
            <div className="flex flex-wrap gap-2 border-b border-border/60 py-2">
              <dt className="font-medium text-fg-muted">Usuario</dt>
              <dd className="m-0 text-fg">{user.name}</dd>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border/60 py-2">
              <dt className="font-medium text-fg-muted">Email</dt>
              <dd className="m-0 text-fg">{user.email}</dd>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border/60 py-2">
              <dt className="font-medium text-fg-muted">Provider</dt>
              <dd className="m-0 text-fg">{user.provider}</dd>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border/60 py-2">
              <dt className="font-medium text-fg-muted">Ultimo login</dt>
              <dd className="m-0 text-fg">{user.lastLogin ?? "sem registro"}</dd>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-border/60 py-2">
              <dt className="font-medium text-fg-muted">Primeiro login</dt>
              <dd className="m-0 text-fg">{user.isFirstLogin ? "sim" : "nao"}</dd>
            </div>
            <div className="flex flex-wrap gap-2 py-2">
              <dt className="font-medium text-fg-muted">Avatar</dt>
              <dd className="m-0 text-fg">{user.avatarUrl ? "configurado" : "nao configurado"}</dd>
            </div>
            <div className="flex flex-wrap gap-2 py-2">
              <dt className="font-medium text-fg-muted">JWT backend</dt>
              <dd className="m-0 text-fg">{session.backendAccessToken ? "recebido" : "ausente"}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/user/update" className="btn-primary inline-flex no-underline">
            Editar usuario
          </Link>
          <LogoutButton />
          <Link href="/login" className="btn-secondary inline-flex no-underline">
            Ir para login
          </Link>
        </div>
      </div>
    </main>
  );
}
