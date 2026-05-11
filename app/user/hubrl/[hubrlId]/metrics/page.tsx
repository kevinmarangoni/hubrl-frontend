import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3, MousePointerClick, Eye, Globe } from "lucide-react";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { fetchMineHubrls, type MineHubrlListItem } from "@/lib/mine-hubrls";

function findMineHubrl(hubrls: MineHubrlListItem[], paramId: string): MineHubrlListItem | undefined {
  const decoded = decodeURIComponent(paramId);
  return hubrls.find((h) => h.hubrlId === decoded || h.id === decoded);
}

export default async function HubrlMetricsPage({ params }: { params: Promise<{ hubrlId: string }> }) {
  const { hubrlId: hubrlIdParam } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const hubrls = await fetchMineHubrls(session.backendAccessToken);
  const hubrl = findMineHubrl(hubrls, hubrlIdParam);

  if (!hubrl) {
    notFound();
  }

  const publicId = hubrl.hubrlId ?? hubrl.id;
  const totalClicks = hubrl.links.reduce((s, l) => s + (l.clickCount ?? 0), 0);
  const countries = Object.entries(hubrl.viewsByCountry ?? {})
    .filter(([code]) => /^[A-Z]{2}$/i.test(code))
    .map(([code, n]) => [code.toUpperCase(), typeof n === "number" && Number.isFinite(n) ? n : 0] as const)
    .sort((a, b) => b[1] - a[1]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <SiteChrome />

      <div className="mb-6">
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
          <BarChart3 className="h-4 w-4" aria-hidden />
          Métricas
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-fg">{hubrl.title}</h1>
        {hubrl.handle ? (
          <p className="m-0 mt-1 text-fg-muted">
            @{hubrl.handle} · ID público: <span className="font-mono text-sm">{publicId}</span>
          </p>
        ) : (
          <p className="m-0 mt-1 font-mono text-sm text-fg-muted">ID público: {publicId}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {hubrl.hubrlId ? (
            <Link href={`/hubrl/${hubrl.hubrlId}`} className="btn-secondary text-sm no-underline">
              Abrir página pública
            </Link>
          ) : null}
          <Link
            href={hubrl.hubrlId ? `/hubrl/${hubrl.hubrlId}/edit` : `/hubrl/${hubrl.id}/edit`}
            className="btn-primary text-sm no-underline"
          >
            Editar hubrl
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2 text-fg-muted">
            <Eye className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <p className="m-0 text-xs font-semibold uppercase tracking-wider">Visitas à página</p>
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums text-fg">{(hubrl.viewCount ?? 0).toLocaleString("pt-BR")}</p>
          <p className="m-0 mt-1 text-sm text-fg-muted">Cada carregamento público conta uma visita.</p>
        </section>
        <section className="glass-panel p-6">
          <div className="flex items-center gap-2 text-fg-muted">
            <MousePointerClick className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <p className="m-0 text-xs font-semibold uppercase tracking-wider">Cliques nos links</p>
          </div>
          <p className="mt-2 text-4xl font-bold tabular-nums text-fg">{totalClicks.toLocaleString("pt-BR")}</p>
          <p className="m-0 mt-1 text-sm text-fg-muted">Soma de todos os botões de link.</p>
        </section>
      </div>

      <section className="glass-panel mt-6 p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <h2 className="m-0 text-lg font-semibold text-fg">Visitas por país</h2>
        </div>
        <p className="m-0 mt-1 text-sm text-fg-muted">
          Estimativa a partir do IP ou da localização enviada pela hospedagem (CDN). Pode não refletir a cidade exata.
        </p>
        {countries.length > 0 ? (
          <ul className="mt-6 grid list-none gap-2 p-0">
            {countries.map(([code, count]) => (
              <li
                key={code}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/30 px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-fg">{code}</span>
                <span className="tabular-nums text-fg-muted">{count.toLocaleString("pt-BR")} visitas</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-fg-muted">Ainda não há dados por país (ou o tráfego foi só local / sem geo).</p>
        )}
      </section>

      <section className="glass-panel mt-6 p-6 md:p-8">
        <h2 className="m-0 text-lg font-semibold text-fg">Cliques por link</h2>
        <p className="m-0 mt-1 text-sm text-fg-muted">Ordem igual à da página pública.</p>
        {hubrl.links.length > 0 ? (
          <ul className="mt-6 grid list-none gap-2 p-0">
            {hubrl.links.map((link, index) => (
              <li
                key={link.linkId ?? `${link.url}-${index}`}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-surface/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="m-0 font-medium text-fg">{link.text}</p>
                  <p className="m-0 truncate font-mono text-xs text-fg-muted">{link.url}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">
                  {(link.clickCount ?? 0).toLocaleString("pt-BR")} cliques
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-fg-muted">Este hubrl ainda não tem links.</p>
        )}
      </section>
    </main>
  );
}
