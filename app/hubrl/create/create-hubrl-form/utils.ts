import {
  clampLayerOpacity,
  DEFAULT_HUBRL_BACKGROUND_LAYERS,
} from "@/lib/hubrl-background-layers";
import {
  createDefaultHubrlPageGradient,
  type HubrlPageGradient,
} from "@/lib/hubrl-page-gradient";
import type { CreateHubrlFormInitialData, HubrlLinkInput, LinkCornerShape } from "./types";

/** Presets por canto: quadrado (4px), semi (16px), circular (9999 → CSS pílula). */
export const LINK_RADIUS_SQUARE_PX = 4;
export const LINK_RADIUS_SEMI_PX = 16;
export const LINK_RADIUS_CIRCULAR_PX = 9999;

export function linkCornerShapeFromPx(px: number): LinkCornerShape {
  if (px >= 500) {
    return "circular";
  }
  if (px <= 8) {
    return "square";
  }
  return "semi";
}

export function linkCornerPxFromShape(shape: LinkCornerShape): number {
  if (shape === "square") {
    return LINK_RADIUS_SQUARE_PX;
  }
  if (shape === "semi") {
    return LINK_RADIUS_SEMI_PX;
  }
  return LINK_RADIUS_CIRCULAR_PX;
}

/** Se os quatro cantos forem iguais, devolve o preset; senão `null` (nenhum botão ativo). */
export function linkUniformCornerPreset(link: HubrlLinkInput): LinkCornerShape | null {
  const {
    borderRadiusTopLeftPx: tl,
    borderRadiusTopRightPx: tr,
    borderRadiusBottomRightPx: br,
    borderRadiusBottomLeftPx: bl,
  } = link;
  if (tl !== tr || tr !== br || br !== bl) {
    return null;
  }
  return linkCornerShapeFromPx(tl);
}

export function createEmptyLink(): HubrlLinkInput {
  return {
    avatarImageUrl: "",
    backgroundColor: "",
    backgroundImageUrl: "",
    linkBackgroundLayers: { ...DEFAULT_HUBRL_BACKGROUND_LAYERS },
    linkGradient: createDefaultHubrlPageGradient(),
    borderRadiusTopLeftPx: LINK_RADIUS_CIRCULAR_PX,
    borderRadiusTopRightPx: LINK_RADIUS_CIRCULAR_PX,
    borderRadiusBottomRightPx: LINK_RADIUS_CIRCULAR_PX,
    borderRadiusBottomLeftPx: LINK_RADIUS_CIRCULAR_PX,
    text: "",
    url: "",
    isAdultOnly: false,
  };
}

export function cloneLinkForEdit(link: HubrlLinkInput): HubrlLinkInput {
  return {
    ...link,
    linkBackgroundLayers: { ...link.linkBackgroundLayers },
    linkGradient: {
      ...link.linkGradient,
      stops: link.linkGradient.stops.map((s) => ({ ...s })),
    },
  };
}

export function parseGradientCss(raw: string | null | undefined): HubrlPageGradient {
  const fallback = createDefaultHubrlPageGradient();
  const css = raw?.trim();
  if (!css) {
    return fallback;
  }

  const linear = /^linear-gradient\(\s*([+-]?\d+(?:\.\d+)?)deg\s*,\s*(.+)\)$/i.exec(css);
  if (linear) {
    const angle = Number(linear[1]);
    const stopsRaw = linear[2]
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const stops = stopsRaw
      .map((part) => {
        const m = /^(#[0-9a-f]{3,6})\s+([+-]?\d+(?:\.\d+)?)%$/i.exec(part);
        if (!m) {
          return null;
        }
        return { id: crypto.randomUUID(), color: m[1], position: Number(m[2]) };
      })
      .filter((s): s is { id: string; color: string; position: number } => Boolean(s));
    if (stops.length >= 2) {
      return { kind: "linear", angleDeg: Number.isFinite(angle) ? angle : 165, stops };
    }
  }

  const radial = /^radial-gradient\(\s*circle\s*,\s*(.+)\)$/i.exec(css);
  if (radial) {
    const stopsRaw = radial[1]
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const stops = stopsRaw
      .map((part) => {
        const m = /^(#[0-9a-f]{3,6})\s+([+-]?\d+(?:\.\d+)?)%$/i.exec(part);
        if (!m) {
          return null;
        }
        return { id: crypto.randomUUID(), color: m[1], position: Number(m[2]) };
      })
      .filter((s): s is { id: string; color: string; position: number } => Boolean(s));
    if (stops.length >= 2) {
      return { kind: "radial", angleDeg: 0, stops };
    }
  }

  return fallback;
}

export function mapInitialLinkToInput(
  link: NonNullable<CreateHubrlFormInitialData["links"]>[number],
): HubrlLinkInput {
  return {
    avatarImageUrl: link.avatarImageUrl?.trim() ?? "",
    backgroundColor: link.backgroundColor?.trim() ?? "",
    backgroundImageUrl: link.backgroundImageUrl?.trim() ?? "",
    linkBackgroundLayers: {
      imageOn: Boolean(link.backgroundImageLayerOn),
      imageOpacity: clampLayerOpacity(link.backgroundImageLayerOpacity ?? 100),
      solidOn: Boolean(link.backgroundSolidLayerOn),
      solidOpacity: clampLayerOpacity(link.backgroundSolidLayerOpacity ?? 100),
      gradientOn: link.backgroundGradientLayerOn === undefined ? true : Boolean(link.backgroundGradientLayerOn),
      gradientOpacity: clampLayerOpacity(link.backgroundGradientLayerOpacity ?? 100),
    },
    linkGradient: parseGradientCss(link.backgroundGradientCss),
    borderRadiusTopLeftPx: link.borderRadiusTopLeftPx ?? LINK_RADIUS_CIRCULAR_PX,
    borderRadiusTopRightPx: link.borderRadiusTopRightPx ?? LINK_RADIUS_CIRCULAR_PX,
    borderRadiusBottomRightPx: link.borderRadiusBottomRightPx ?? LINK_RADIUS_CIRCULAR_PX,
    borderRadiusBottomLeftPx: link.borderRadiusBottomLeftPx ?? LINK_RADIUS_CIRCULAR_PX,
    text: link.text ?? "",
    url: link.url ?? "",
    isAdultOnly: Boolean(link.isAdultOnly),
    ...(typeof link.linkId === "string" && link.linkId.trim() ? { linkId: link.linkId.trim() } : {}),
  };
}

/** URL segura para abrir numa nova aba a partir do texto do utilizador. */
export function safeExternalHref(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) {
    return undefined;
  }
  const lower = t.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return undefined;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  if (/^mailto:/i.test(t) || /^\//.test(t)) {
    return t;
  }
  if (/^\/\//.test(t)) {
    return `https:${t}`;
  }
  return `https://${t}`;
}
