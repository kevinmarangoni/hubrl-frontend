import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { CreateHubrlForm } from "@/app/hubrl/create/create-hubrl-form";
import { authOptions } from "@/lib/auth";

type HubrlItem = {
  id: string;
  hubrlId?: string | null;
  title: string;
  handle: string | null;
  description: string | null;
  profileImageUrl: string | null;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientCss: string | null;
  backgroundImageLayerOn: boolean;
  backgroundImageLayerOpacity: number;
  backgroundSolidLayerOn: boolean;
  backgroundSolidLayerOpacity: number;
  backgroundGradientLayerOn: boolean;
  backgroundGradientLayerOpacity: number;
  cardBackgroundColor?: string | null;
  cardBackgroundImageUrl?: string | null;
  cardBackgroundGradientCss?: string | null;
  cardBackgroundImageLayerOn?: boolean;
  cardBackgroundImageLayerOpacity?: number;
  cardBackgroundSolidLayerOn?: boolean;
  cardBackgroundSolidLayerOpacity?: number;
  cardBackgroundGradientLayerOn?: boolean;
  cardBackgroundGradientLayerOpacity?: number;
  links: Array<{
    avatarImageUrl: string | null;
    backgroundColor: string | null;
    backgroundImageUrl: string | null;
    backgroundGradientCss: string | null;
    backgroundImageLayerOn: boolean;
    backgroundImageLayerOpacity: number;
    backgroundSolidLayerOn: boolean;
    backgroundSolidLayerOpacity: number;
    backgroundGradientLayerOn: boolean;
    backgroundGradientLayerOpacity: number;
    borderRadiusTopLeftPx: number;
    borderRadiusTopRightPx: number;
    borderRadiusBottomRightPx: number;
    borderRadiusBottomLeftPx: number;
    text: string;
    url: string;
    isAdultOnly: boolean;
  }>;
};

const backendBaseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export default async function EditHubrlPage({ params }: { params: Promise<{ hubrlId: string }> }) {
  const { hubrlId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const response = await fetch(`${backendBaseUrl}/hubrls/mine`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.backendAccessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    notFound();
  }

  const hubrls = (await response.json()) as HubrlItem[];
  const hubrl = hubrls.find((item) => item.hubrlId === hubrlId || item.id === hubrlId);
  if (!hubrl) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8 md:px-6">
      <SiteChrome />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="m-0 text-2xl font-bold text-fg">Editar Hubrl</h1>
          <p className="m-0 text-sm text-fg-muted">ID público: {hubrl.hubrlId ?? hubrl.id}</p>
        </div>
        <Link href="/hubrls" className="btn-secondary text-sm no-underline">
          Voltar
        </Link>
      </div>
      <CreateHubrlForm
        initialData={{
          hubrlId: hubrl.hubrlId ?? hubrl.id,
          title: hubrl.title,
          handle: hubrl.handle ?? "",
          description: hubrl.description ?? "",
          profileImageUrl: hubrl.profileImageUrl ?? "",
          backgroundColor: hubrl.backgroundColor ?? "",
          backgroundImageUrl: hubrl.backgroundImageUrl ?? "",
          backgroundGradientCss: hubrl.backgroundGradientCss,
          backgroundImageLayerOn: hubrl.backgroundImageLayerOn,
          backgroundImageLayerOpacity: hubrl.backgroundImageLayerOpacity,
          backgroundSolidLayerOn: hubrl.backgroundSolidLayerOn,
          backgroundSolidLayerOpacity: hubrl.backgroundSolidLayerOpacity,
          backgroundGradientLayerOn: hubrl.backgroundGradientLayerOn,
          backgroundGradientLayerOpacity: hubrl.backgroundGradientLayerOpacity,
          cardBackgroundColor: hubrl.cardBackgroundColor ?? "",
          cardBackgroundImageUrl: hubrl.cardBackgroundImageUrl ?? "",
          cardBackgroundGradientCss: hubrl.cardBackgroundGradientCss ?? null,
          cardBackgroundImageLayerOn: hubrl.cardBackgroundImageLayerOn ?? false,
          cardBackgroundImageLayerOpacity: hubrl.cardBackgroundImageLayerOpacity ?? 100,
          cardBackgroundSolidLayerOn: hubrl.cardBackgroundSolidLayerOn ?? false,
          cardBackgroundSolidLayerOpacity: hubrl.cardBackgroundSolidLayerOpacity ?? 100,
          cardBackgroundGradientLayerOn: hubrl.cardBackgroundGradientLayerOn ?? true,
          cardBackgroundGradientLayerOpacity: hubrl.cardBackgroundGradientLayerOpacity ?? 100,
          links: hubrl.links,
        }}
      />
    </main>
  );
}
