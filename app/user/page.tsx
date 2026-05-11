import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, BarChart3, LayoutGrid, Pencil, Sparkles } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { LogoutButton } from "@/components/logout-button";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";
import { fetchMineHubrls } from "@/lib/mine-hubrls";
import type { UserProfileResponse } from "./types";
import { firstName, providerBadge } from "./utils";

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const [userResponse, hubrls] = await Promise.all([
    backend.get("users/me", session.backendAccessToken, { cache: "no-store" }),
    fetchMineHubrls(session.backendAccessToken),
  ]);

  if (!userResponse.ok) {
    redirect("/login");
  }

  const user = (await userResponse.json()) as UserProfileResponse;
  const totalLinks = hubrls.reduce((acc, h) => acc + h.links.length, 0);
  const totalViews = hubrls.reduce((acc, h) => acc + (h.viewCount ?? 0), 0);
  const totalClicks = hubrls.reduce(
    (acc, h) => acc + h.links.reduce((s, l) => s + (l.clickCount ?? 0), 0),
    0,
  );
  const countryAgg: Record<string, number> = {};
  for (const h of hubrls) {
    const v = h.viewsByCountry;
    if (!v || typeof v !== "object") {
      continue;
    }
    for (const [code, n] of Object.entries(v)) {
      if (typeof n === "number" && Number.isFinite(n)) {
        countryAgg[code] = (countryAgg[code] ?? 0) + n;
      }
    }
  }
  const topCountries = Object.entries(countryAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const recent = hubrls.slice(0, 5);
  const greeting = firstName(user.name ?? user.email ?? "aí");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <SiteChrome />

      <header className="mb-8">
        <p className="m-0 text-sm font-medium text-accent">Painel</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-fg md:text-4xl">Olá, {greeting}</h1>
        <p className="mt-2 max-w-xl text-pretty text-fg-muted">
          Gerencie seus hubrls, abra as páginas públicas e atualize o perfil a partir daqui.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass-panel flex flex-col gap-4 p-6 lg:col-span-1">
          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Foto de perfil de ${user.name}`}
                className="size-16 shrink-0 rounded-full border border-border object-cover shadow-glow"
              />
            ) : (
              <div className="grid size-16 shrink-0 place-items-center rounded-full border border-border bg-accent-muted text-lg font-bold text-accent">
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-lg font-semibold text-fg">{user.name}</p>
              <p className="m-0 truncate text-sm text-fg-muted">{user.email}</p>
              <span className="mt-2 inline-block rounded-full border border-border/80 bg-surface/50 px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                {providerBadge(user.provider)}
              </span>
            </div>
          </div>
          <Link href="/user/update" className="btn-secondary inline-flex w-full justify-center no-underline">
            <Pencil className="mr-2 h-4 w-4 shrink-0" aria-hidden />
            Editar perfil
          </Link>
        </section>

        <div className="grid content-start gap-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-fg-muted">Hubrls</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-fg">{hubrls.length}</p>
              <p className="m-0 mt-1 text-sm text-fg-muted">Páginas públicas criadas</p>
            </div>
            <div className="glass-panel p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-fg-muted">Visitas</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-fg">{totalViews}</p>
              <p className="m-0 mt-1 text-sm text-fg-muted">Visualizações das páginas</p>
            </div>
            <div className="glass-panel p-5 sm:col-span-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-fg-muted">Cliques em links</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-fg">{totalClicks}</p>
              <p className="m-0 mt-1 text-sm text-fg-muted">
                {totalLinks} link{totalLinks === 1 ? "" : "s"} no total
              </p>
            </div>
          </div>

          {topCountries.length > 0 ? (
            <p className="m-0 text-center text-xs text-fg-muted md:text-left">
              Visitas por país (estimativa):{" "}
              {topCountries.map(([code, n]) => `${code} (${n})`).join(" · ")}
            </p>
          ) : null}

          <section className="glass-panel p-6">
            <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-fg-muted">Ações rápidas</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/hubrl/create"
                className="btn-primary inline-flex items-center gap-2 no-underline"
              >
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
                Criar hubrl
              </Link>
              <Link href="/user" className="btn-secondary inline-flex items-center gap-2 no-underline">
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                Painel
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="glass-panel mt-6 p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-lg font-semibold text-fg">Seus hubrls</h2>
            <p className="m-0 mt-1 text-sm text-fg-muted">Atalhos para abrir ou editar.</p>
          </div>
          {hubrls.length > 0 ? (
            <Link href="/user" className="link-accent text-sm font-medium">
              Ver todos no painel
            </Link>
          ) : null}
        </div>

        {recent.length > 0 ? (
          <ul className="mt-6 grid list-none gap-2 p-0">
            {recent.map((hubrl) => (
              <li
                key={hubrl.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-surface/30 px-4 py-3 backdrop-blur-sm transition hover:border-accent/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-medium text-fg">{hubrl.title}</p>
                  {hubrl.handle ? (
                    <p className="m-0 text-xs text-fg-muted">@{hubrl.handle}</p>
                  ) : null}
                </div>
                <span className="text-xs text-fg-muted tabular-nums">
                  {hubrl.viewCount ?? 0} visitas ·{" "}
                  {hubrl.links.reduce((s, l) => s + (l.clickCount ?? 0), 0)} cliques · {hubrl.links.length}{" "}
                  link{hubrl.links.length === 1 ? "" : "s"}
                </span>
                <div className="ml-auto flex shrink-0 flex-wrap gap-2">
                  {hubrl.hubrlId ? (
                    <Link href={`/hubrl/${hubrl.hubrlId}`} className="btn-secondary px-3 py-1.5 text-xs no-underline">
                      Abrir
                    </Link>
                  ) : null}
                  <Link
                    href={`/user/hubrl/${encodeURIComponent(hubrl.hubrlId ?? hubrl.id)}/metrics`}
                    className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs no-underline"
                  >
                    <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Métricas
                  </Link>
                  <Link
                    href={hubrl.hubrlId ? `/hubrl/${hubrl.hubrlId}/edit` : `/hubrl/${hubrl.id}/edit`}
                    className="btn-primary px-3 py-1.5 text-xs no-underline"
                  >
                    Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface/20 px-6 py-10 text-center">
            <p className="m-0 text-fg-muted">Você ainda não criou nenhum hubrl.</p>
            <Link
              href="/hubrl/create"
              className="btn-primary mt-4 inline-flex items-center gap-2 no-underline"
            >
              Criar o primeiro
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-end border-t border-border/60 pt-6">
        <LogoutButton />
      </div>
    </main>
  );
}
