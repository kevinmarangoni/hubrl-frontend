import { clampLayerOpacity } from "@/lib/hubrl-background-layers";
import { backendUrl, http } from "@/lib/http";
import type { HubrlView } from "./types";

export type HubrlLayerBackgroundInput = {
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  backgroundGradientCss: string | null;
  backgroundImageLayerOn: boolean;
  backgroundImageLayerOpacity: number;
  backgroundSolidLayerOn: boolean;
  backgroundSolidLayerOpacity: number;
  backgroundGradientLayerOn: boolean;
  backgroundGradientLayerOpacity: number;
};

export function isValidHexColor(raw: string | null | undefined): raw is string {
  return typeof raw === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw.trim());
}

export function buildLayeredBackground(input: HubrlLayerBackgroundInput) {
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

export async function getHubrlById(hubrlId: string): Promise<HubrlView | null> {
  const response = await http.get(backendUrl(`hubrls/${encodeURIComponent(hubrlId)}`), {
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

export function mapToVisualLayers(input: HubrlLayerBackgroundInput) {
  const bg = buildLayeredBackground(input);
  return {
    bg,
    hasImage: input.backgroundImageLayerOn && Boolean(input.backgroundImageUrl?.trim()),
  };
}
