import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";

type HubrlLink = {
  text: string;
  url: string;
  isAdultOnly: boolean;
};

type HubrlItem = {
  id: string;
  hubrlId?: string;
  title: string;
  handle: string | null;
  description: string | null;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientCss?: string | null;
  backgroundImageLayerOn?: boolean;
  backgroundImageLayerOpacity?: number;
  backgroundSolidLayerOn?: boolean;
  backgroundSolidLayerOpacity?: number;
  backgroundGradientLayerOn?: boolean;
  backgroundGradientLayerOpacity?: number;
  links: HubrlLink[];
};

const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

async function getMineHubrls(accessToken: string): Promise<HubrlItem[]> {
  const response = await fetch(`${backendBaseUrl}/hubrls/mine`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as HubrlItem[];
}

export default async function HubrlsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const hubrls = await getMineHubrls(session.backendAccessToken);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <SiteChrome />
      <div className="glass-panel p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="m-0 text-2xl font-bold text-fg">Meus Hubrl&apos;s</h1>
          <Link href="/hubrl/create" className="btn-primary inline-flex shrink-0 no-underline">
            Criar novo hubrl
          </Link>
        </div>

        {hubrls.length ? (
          <ul className="mt-8 grid list-none gap-3 p-0">
            {hubrls.map((hubrl) => (
              <li
                key={hubrl.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-surface/40 px-4 py-3 backdrop-blur-sm transition hover:border-accent/35 hover:shadow-glow"
              >
                <div className="flex flex-col gap-0.5">
                  <strong className="text-fg">{hubrl.title}</strong>
                  {hubrl.handle ? (
                    <span className="text-xs text-fg-muted">@{hubrl.handle}</span>
                  ) : null}
                </div>
                <span className="ml-auto shrink-0 text-sm text-fg-muted">{hubrl.links.length} links</span>
                {hubrl.hubrlId ? (
                  <>
                    <Link href={`/hubrl/${hubrl.hubrlId}`} className="btn-secondary text-xs no-underline">
                      Abrir página
                    </Link>
                    <Link href={`/hubrl/${hubrl.hubrlId}/edit`} className="btn-primary text-xs no-underline">
                      Editar
                    </Link>
                  </>
                ) : (
                  <Link href={`/hubrl/${hubrl.id}/edit`} className="btn-primary text-xs no-underline">
                    Editar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-fg-muted">Nenhum hubrl criado ainda.</p>
        )}
      </div>
    </main>
  );
}
