import { notFound } from "next/navigation";
import { clampLayerOpacity } from "@/lib/hubrl-background-layers";
import { linkPillBorderRadiusStyle } from "@/lib/hubrl-link-pill-preview";

type HubrlLinkItem = {
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
};

type HubrlView = {
  id: string;
  hubrlId: string;
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
  links: HubrlLinkItem[];
};

const backendBaseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

function isValidHexColor(raw: string | null | undefined): raw is string {
  return typeof raw === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw.trim());
}

function buildLayeredBackground(input: {
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientCss: string | null;
  backgroundImageLayerOn: boolean;
  backgroundImageLayerOpacity: number;
  backgroundSolidLayerOn: boolean;
  backgroundSolidLayerOpacity: number;
  backgroundGradientLayerOn: boolean;
  backgroundGradientLayerOpacity: number;
}) {
  const imageUrl = input.backgroundImageUrl?.trim() ?? "";
  const solidColor = input.backgroundColor?.trim() ?? "";
  const gradientCss = input.backgroundGradientCss?.trim() ?? "";
  const hasImage = input.backgroundImageLayerOn && imageUrl.length > 0 && input.backgroundImageLayerOpacity > 0;
  const hasGradient =
    input.backgroundGradientLayerOn && gradientCss.length > 0 && input.backgroundGradientLayerOpacity > 0;
  const hasSolid = input.backgroundSolidLayerOn && isValidHexColor(solidColor) && input.backgroundSolidLayerOpacity > 0;

  if (!hasImage && !hasGradient && !hasSolid) {
    return {
      backgroundImage: "linear-gradient(165deg, #4c1d95 0%, #6d28d9 45%, #c084fc 100%)",
    } as const;
  }

  const layers: string[] = [];
  if (hasImage) {
    layers.push(
      `linear-gradient(rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundImageLayerOpacity) / 100}), rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundImageLayerOpacity) / 100})), url("${imageUrl}")`,
    );
  }
  if (hasGradient) {
    layers.push(
      `linear-gradient(rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundGradientLayerOpacity) / 100}), rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundGradientLayerOpacity) / 100})), ${gradientCss}`,
    );
  }
  if (hasSolid) {
    layers.push(
      `linear-gradient(rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundSolidLayerOpacity) / 100}), rgba(255,255,255,${1 - clampLayerOpacity(input.backgroundSolidLayerOpacity) / 100})), linear-gradient(${solidColor}, ${solidColor})`,
    );
  }

  return {
    backgroundImage: layers.join(", "),
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: hasImage ? "cover" : undefined,
  } as const;
}

async function getHubrlById(hubrlId: string): Promise<HubrlView | null> {
  const response = await fetch(`${backendBaseUrl}/hubrls/${encodeURIComponent(hubrlId)}`, {
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as HubrlView;
}

function mapToVisualLayers(input: {
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientCss: string | null;
  backgroundImageLayerOn: boolean;
  backgroundImageLayerOpacity: number;
  backgroundSolidLayerOn: boolean;
  backgroundSolidLayerOpacity: number;
  backgroundGradientLayerOn: boolean;
  backgroundGradientLayerOpacity: number;
}) {
  const bg = buildLayeredBackground(input);
  return {
    bg,
    hasImage: input.backgroundImageLayerOn && Boolean(input.backgroundImageUrl?.trim()),
  };
}

export default async function HubrlByIdPage({ params }: { params: Promise<{ hubrlId: string }> }) {
  const { hubrlId } = await params;
  const hubrl = await getHubrlById(hubrlId);
  if (!hubrl) {
    notFound();
  }

  const pageVisual = mapToVisualLayers({
    backgroundColor: hubrl.backgroundColor,
    backgroundImageUrl: hubrl.backgroundImageUrl,
    backgroundGradientCss: hubrl.backgroundGradientCss,
    backgroundImageLayerOn: hubrl.backgroundImageLayerOn,
    backgroundImageLayerOpacity: hubrl.backgroundImageLayerOpacity,
    backgroundSolidLayerOn: hubrl.backgroundSolidLayerOn,
    backgroundSolidLayerOpacity: hubrl.backgroundSolidLayerOpacity,
    backgroundGradientLayerOn: hubrl.backgroundGradientLayerOn,
    backgroundGradientLayerOpacity: hubrl.backgroundGradientLayerOpacity,
  });
  const cardVisual = mapToVisualLayers({
    backgroundColor: hubrl.cardBackgroundColor ?? hubrl.backgroundColor ?? null,
    backgroundImageUrl: hubrl.cardBackgroundImageUrl ?? hubrl.backgroundImageUrl ?? null,
    backgroundGradientCss: hubrl.cardBackgroundGradientCss ?? hubrl.backgroundGradientCss ?? null,
    backgroundImageLayerOn:
      hubrl.cardBackgroundImageLayerOn !== undefined
        ? Boolean(hubrl.cardBackgroundImageLayerOn)
        : hubrl.backgroundImageLayerOn,
    backgroundImageLayerOpacity:
      hubrl.cardBackgroundImageLayerOpacity !== undefined
        ? hubrl.cardBackgroundImageLayerOpacity
        : hubrl.backgroundImageLayerOpacity,
    backgroundSolidLayerOn:
      hubrl.cardBackgroundSolidLayerOn !== undefined
        ? Boolean(hubrl.cardBackgroundSolidLayerOn)
        : hubrl.backgroundSolidLayerOn,
    backgroundSolidLayerOpacity:
      hubrl.cardBackgroundSolidLayerOpacity !== undefined
        ? hubrl.cardBackgroundSolidLayerOpacity
        : hubrl.backgroundSolidLayerOpacity,
    backgroundGradientLayerOn:
      hubrl.cardBackgroundGradientLayerOn !== undefined
        ? Boolean(hubrl.cardBackgroundGradientLayerOn)
        : hubrl.backgroundGradientLayerOn,
    backgroundGradientLayerOpacity:
      hubrl.cardBackgroundGradientLayerOpacity !== undefined
        ? hubrl.cardBackgroundGradientLayerOpacity
        : hubrl.backgroundGradientLayerOpacity,
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0" style={pageVisual.bg} aria-hidden />
      {pageVisual.hasImage ? <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" aria-hidden /> : null}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
        <section
          className="relative w-full max-w-[22.5rem] overflow-hidden rounded-[2rem] border border-white/25 px-6 pb-10 pt-12 shadow-2xl shadow-black/30"
          style={cardVisual.bg}
        >
          {cardVisual.hasImage ? <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" aria-hidden /> : null}
          <div className="relative z-10 flex flex-col items-center">
            {hubrl.profileImageUrl ? (
              <img
                src={hubrl.profileImageUrl}
                alt={`Foto de ${hubrl.title}`}
                className="size-28 rounded-full border-4 border-white/70 object-cover shadow-lg"
              />
            ) : null}

            <h1 className="mt-5 w-full border-b border-white/35 pb-2 text-center text-4xl font-bold text-white">
              {hubrl.title}
            </h1>

            <div className="mt-3 flex w-full items-center justify-center gap-1 border-b border-white/35 pb-2 text-white">
              <span className="text-2xl font-semibold">@</span>
              <span className="text-lg font-medium">{hubrl.handle ?? "sem-handle"}</span>
            </div>

            <div className="mt-4 w-full rounded-xl border border-white/30 bg-black/15 px-3 py-2.5 text-sm text-white">
              {hubrl.description?.trim() || "Um pouco sobre você..."}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3">
              {hubrl.links.length ? (
                hubrl.links.map((link, index) => {
                  const linkBackground = buildLayeredBackground({
                    backgroundColor: link.backgroundColor,
                    backgroundImageUrl: link.backgroundImageUrl,
                    backgroundGradientCss: link.backgroundGradientCss,
                    backgroundImageLayerOn: link.backgroundImageLayerOn,
                    backgroundImageLayerOpacity: link.backgroundImageLayerOpacity,
                    backgroundSolidLayerOn: link.backgroundSolidLayerOn,
                    backgroundSolidLayerOpacity: link.backgroundSolidLayerOpacity,
                    backgroundGradientLayerOn: link.backgroundGradientLayerOn,
                    backgroundGradientLayerOpacity: link.backgroundGradientLayerOpacity,
                  });
                  const borderRadius = linkPillBorderRadiusStyle({
                    topLeft: link.borderRadiusTopLeftPx,
                    topRight: link.borderRadiusTopRightPx,
                    bottomRight: link.borderRadiusBottomRightPx,
                    bottomLeft: link.borderRadiusBottomLeftPx,
                  });
                  return (
                    <a
                      key={`${link.url}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex min-h-[52px] w-full items-center gap-2 overflow-hidden border-2 border-white/85 px-3 py-2.5 text-white no-underline shadow-sm transition hover:brightness-110"
                      style={{ ...linkBackground, borderRadius }}
                    >
                      {link.backgroundImageLayerOn && link.backgroundImageUrl ? (
                        <div className="pointer-events-none absolute inset-0 bg-black/30" aria-hidden />
                      ) : null}
                      {link.avatarImageUrl ? (
                        <img
                          src={link.avatarImageUrl}
                          alt=""
                          className="relative z-10 size-8 shrink-0 rounded-full border-2 border-white/55 object-cover"
                        />
                      ) : null}
                      <span className="relative z-10 min-w-0 flex-1 text-center text-sm font-semibold">{link.text}</span>
                      {link.isAdultOnly ? (
                        <span className="relative z-10 shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          18+
                        </span>
                      ) : null}
                    </a>
                  );
                })
              ) : (
                <div className="flex w-full min-h-[52px] items-center justify-center rounded-full border-2 border-white/85 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                  Sem links ainda
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
