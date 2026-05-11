import type { HubrlBackgroundLayersState } from "@/lib/hubrl-background-layers";
import type { HubrlPageGradient } from "@/lib/hubrl-page-gradient";

export type HubrlLinkInput = {
  /** Preservado ao editar para métricas de clique no backend. */
  linkId?: string;
  avatarImageUrl: string;
  backgroundColor: string;
  backgroundImageUrl: string;
  linkBackgroundLayers: HubrlBackgroundLayersState;
  linkGradient: HubrlPageGradient;
  borderRadiusTopLeftPx: number;
  borderRadiusTopRightPx: number;
  borderRadiusBottomRightPx: number;
  borderRadiusBottomLeftPx: number;
  text: string;
  url: string;
  isAdultOnly: boolean;
};

export type CreateHubrlFormInitialData = {
  hubrlId?: string;
  title: string;
  handle: string;
  description?: string;
  profileImageUrl: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundGradientCss?: string | null;
  backgroundLayers?: HubrlBackgroundLayersState;
  backgroundImageLayerOn?: boolean;
  backgroundImageLayerOpacity?: number;
  backgroundSolidLayerOn?: boolean;
  backgroundSolidLayerOpacity?: number;
  backgroundGradientLayerOn?: boolean;
  backgroundGradientLayerOpacity?: number;
  cardBackgroundColor?: string;
  cardBackgroundImageUrl?: string;
  cardBackgroundGradientCss?: string | null;
  cardBackgroundImageLayerOn?: boolean;
  cardBackgroundImageLayerOpacity?: number;
  cardBackgroundSolidLayerOn?: boolean;
  cardBackgroundSolidLayerOpacity?: number;
  cardBackgroundGradientLayerOn?: boolean;
  cardBackgroundGradientLayerOpacity?: number;
  links?: Array<{
    avatarImageUrl?: string | null;
    backgroundColor?: string | null;
    backgroundImageUrl?: string | null;
    backgroundGradientCss?: string | null;
    backgroundImageLayerOn?: boolean;
    backgroundImageLayerOpacity?: number;
    backgroundSolidLayerOn?: boolean;
    backgroundSolidLayerOpacity?: number;
    backgroundGradientLayerOn?: boolean;
    backgroundGradientLayerOpacity?: number;
    borderRadiusTopLeftPx?: number | null;
    borderRadiusTopRightPx?: number | null;
    borderRadiusBottomRightPx?: number | null;
    borderRadiusBottomLeftPx?: number | null;
    linkId?: string;
    clickCount?: number;
    text: string;
    url: string;
    isAdultOnly?: boolean;
  }>;
};

export type LinkCornerShape = "square" | "semi" | "circular";

export type ImageUploadSlot = "profile" | "pageBackground" | "cardBackground" | "draftAvatar" | "draftBg";
