/** Camadas de fundo da página do hubrl (podem combinar-se). Opacidades em 0–100. */

export type HubrlBackgroundLayersState = {
  imageOn: boolean;
  imageOpacity: number;
  solidOn: boolean;
  solidOpacity: number;
  gradientOn: boolean;
  gradientOpacity: number;
};

export const DEFAULT_HUBRL_BACKGROUND_LAYERS: HubrlBackgroundLayersState = {
  imageOn: false,
  imageOpacity: 100,
  solidOn: false,
  solidOpacity: 100,
  gradientOn: true,
  gradientOpacity: 100,
};

export function clampLayerOpacity(n: number): number {
  if (!Number.isFinite(n)) {
    return 100;
  }
  return Math.min(100, Math.max(0, Math.round(n)));
}
