import { clampLayerOpacity, type HubrlBackgroundLayersState } from "@/lib/hubrl-background-layers";
import { hubrlPageGradientToCss, type HubrlPageGradient } from "@/lib/hubrl-page-gradient";

export type HubrlLinkPillLayerInput = {
  backgroundColor: string;
  backgroundImageUrl: string;
  linkBackgroundLayers: HubrlBackgroundLayersState;
  linkGradient: HubrlPageGradient;
};

/** Dados para empilhar fundos no preview do botão do link (mesma lógica do hero da página). */
export function computeLinkPillBackgroundStack(input: HubrlLinkPillLayerInput) {
  const img = input.backgroundImageUrl.trim();
  const c = input.backgroundColor.trim();
  const validHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);
  const layers = input.linkBackgroundLayers;
  const hasImage = layers.imageOn && img.length > 0 && layers.imageOpacity > 0;
  const hasGradient = layers.gradientOn && layers.gradientOpacity > 0;
  const hasSolid = layers.solidOn && validHex && layers.solidOpacity > 0;
  const showBase = !hasImage && !hasGradient && !hasSolid;
  return {
    img,
    c,
    hasImage,
    hasGradient,
    hasSolid,
    showBase,
    gradientCss: hubrlPageGradientToCss(input.linkGradient),
    clampOpacity: clampLayerOpacity,
  };
}

/** Cantos em px (ordem CSS: superior esquerdo, superior direito, inferior direito, inferior esquerdo). */
export type HubrlLinkCornersRadiusPx = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

export function linkPillCornerRadiusCssValue(px: number): string {
  if (!Number.isFinite(px) || px < 0) {
    return "0px";
  }
  if (px >= 500) {
    return "9999px";
  }
  return `${Math.min(48, Math.round(px))}px`;
}

export function linkPillBorderRadiusStyle(corners: HubrlLinkCornersRadiusPx): string {
  return [
    linkPillCornerRadiusCssValue(corners.topLeft),
    linkPillCornerRadiusCssValue(corners.topRight),
    linkPillCornerRadiusCssValue(corners.bottomRight),
    linkPillCornerRadiusCssValue(corners.bottomLeft),
  ].join(" ");
}
