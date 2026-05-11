import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { CreateHubrlForm } from "@/app/hubrl/create/create-hubrl-form";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";
import type { HubrlEditListItem } from "./types";

export default async function EditHubrlPage({ params }: { params: Promise<{ hubrlId: string }> }) {
  const { hubrlId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const response = await backend.get("hubrls/mine", session.backendAccessToken, { cache: "no-store" });

  if (response.status === 401) {
    redirect("/login");
  }
  if (!response.ok) {
    notFound();
  }

  const hubrls = (await response.json()) as HubrlEditListItem[];
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
        <Link href="/user" className="btn-secondary text-sm no-underline">
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
