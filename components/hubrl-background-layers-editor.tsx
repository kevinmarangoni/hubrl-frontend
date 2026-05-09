"use client";

import { Cog, X } from "lucide-react";
import { ColorPickerField } from "@/components/color-picker-field";
import { HubrlGradientEditor } from "@/components/hubrl-gradient-editor";
import { ImagePickerFields } from "@/components/image-picker-fields";
import { clampLayerOpacity, type HubrlBackgroundLayersState } from "@/lib/hubrl-background-layers";
import type { HubrlPageGradient } from "@/lib/hubrl-page-gradient";

type LayerKind = "image" | "solid" | "gradient";

export type HubrlBackgroundLayersEditorPanel = "menu" | LayerKind;

function HubrlLayerSwitch({
  id,
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <label htmlFor={id} className={`inline-flex shrink-0 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
        aria-label={ariaLabel}
      />
      <span className="hubrl-layer-switch">
        <span className="hubrl-layer-switch-thumb" />
      </span>
    </label>
  );
}

function LayerOpacityControl({
  id,
  label,
  value,
  onChange,
  disabled,
  className = "",
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const v = clampLayerOpacity(value);
  return (
    <div
      className={`rounded-lg border border-border/55 bg-surface/45 px-2.5 py-2.5${disabled ? " pointer-events-none opacity-40" : ""}${className ? ` ${className}` : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-fg">
          {label}
        </label>
        <span className="rounded-md bg-black/35 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-sm ring-1 ring-white/10 dark:bg-white/15 dark:ring-white/15">
          {v}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={v}
        disabled={disabled}
        onChange={(e) => onChange(clampLayerOpacity(Number(e.target.value)))}
        className="hubrl-opacity-range block w-full"
      />
    </div>
  );
}

/** Linha compacta: interruptor «Ativa» à esquerda, opacidade à direita. */
function LayerActiveWithOpacity({
  idPrefix,
  layer,
  layers,
  patchLayers,
}: {
  idPrefix: string;
  layer: LayerKind;
  layers: HubrlBackgroundLayersState;
  patchLayers: (partial: Partial<HubrlBackgroundLayersState>) => void;
}) {
  const on =
    layer === "image" ? layers.imageOn : layer === "solid" ? layers.solidOn : layers.gradientOn;
  const opacity =
    layer === "image"
      ? layers.imageOpacity
      : layer === "solid"
        ? layers.solidOpacity
        : layers.gradientOpacity;
  const opacityId = `${idPrefix}-${layer}-opacity-panel`;
  const label =
    layer === "image"
      ? "Opacidade da camada de imagem"
      : layer === "solid"
        ? "Opacidade da camada de cor"
        : "Opacidade da camada de degradê";
  const ariaSwitch =
    layer === "image"
      ? "Ativar camada de imagem"
      : layer === "solid"
        ? "Ativar camada de cor"
        : "Ativar camada de degradê";

  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border/55 bg-surface/40 p-2 sm:flex-row sm:items-stretch sm:gap-0 sm:p-2">
      <div className="flex shrink-0 flex-row items-center justify-between gap-2 sm:w-[4.75rem] sm:flex-col sm:justify-center sm:gap-1 sm:border-r sm:border-border/45 sm:pr-2">
        <span className="text-[10px] font-bold uppercase leading-none tracking-wide text-fg-muted">
          Ativo
        </span>
        <HubrlLayerSwitch
          id={`${idPrefix}-panel-layer-${layer}`}
          checked={on}
          onCheckedChange={(checked) => {
            if (layer === "image") {
              patchLayers({ imageOn: checked });
            } else if (layer === "solid") {
              patchLayers({ solidOn: checked });
            } else {
              patchLayers({ gradientOn: checked });
            }
          }}
          aria-label={ariaSwitch}
        />
      </div>
      <div className="min-w-0 flex-1 sm:pl-2">
        <LayerOpacityControl
          id={opacityId}
          label={label}
          value={opacity}
          onChange={(v) => {
            const o = clampLayerOpacity(v);
            if (layer === "image") {
              patchLayers({ imageOpacity: o });
            } else if (layer === "solid") {
              patchLayers({ solidOpacity: o });
            } else {
              patchLayers({ gradientOpacity: o });
            }
          }}
          disabled={!on}
          className="border-0 bg-transparent px-0 py-1 shadow-none"
        />
      </div>
    </div>
  );
}

function layerRow(
  layers: HubrlBackgroundLayersState,
  onLayersChange: (next: HubrlBackgroundLayersState) => void,
  idPrefix: string,
  kind: LayerKind,
  on: boolean,
  title: string,
  description: string,
  onPanelChange: (p: HubrlBackgroundLayersEditorPanel) => void,
) {
  function patch(next: HubrlBackgroundLayersState) {
    onLayersChange(next);
  }

  return (
    <div className="rounded-lg border border-border/60 bg-surface/40 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <HubrlLayerSwitch
          id={`${idPrefix}-menu-layer-${kind}`}
          checked={on}
          onCheckedChange={(checked) => {
            if (kind === "image") {
              patch({ ...layers, imageOn: checked });
            } else if (kind === "solid") {
              patch({ ...layers, solidOn: checked });
            } else {
              patch({ ...layers, gradientOn: checked });
            }
          }}
          aria-label={`Ativar ${title}`}
        />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold text-fg">{title}</p>
          <p className="mt-0.5 text-xs leading-snug text-fg-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onPanelChange(kind)}
          className="btn-secondary inline-flex size-8 shrink-0 items-center justify-center p-0"
          aria-label={`Ajustar ${title}`}
        >
          <Cog className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export type HubrlBackgroundLayersEditorProps = {
  /** Prefixo único para ids de controlos (ex.: `hubrl-page`, `hubrl-link-draft`). */
  idPrefix: string;
  menuTitle: string;
  menuDescription?: string;
  layers: HubrlBackgroundLayersState;
  onLayersChange: (next: HubrlBackgroundLayersState) => void;
  backgroundImageUrl: string;
  onBackgroundImageUrlChange: (v: string) => void;
  onBackgroundFileChange: (file: File | null) => void;
  backgroundColor: string;
  onBackgroundColorChange: (v: string) => void;
  isBackgroundUploading: boolean;
  backgroundImageFieldKey?: number;
  pageGradient: HubrlPageGradient;
  onPageGradientChange: (next: HubrlPageGradient) => void;
  panel: HubrlBackgroundLayersEditorPanel;
  onPanelChange: (p: HubrlBackgroundLayersEditorPanel) => void;
};

export function HubrlBackgroundLayersEditor({
  idPrefix,
  menuTitle,
  menuDescription,
  layers,
  onLayersChange,
  backgroundImageUrl,
  onBackgroundImageUrlChange,
  onBackgroundFileChange,
  backgroundColor,
  onBackgroundColorChange,
  isBackgroundUploading,
  backgroundImageFieldKey = 0,
  pageGradient,
  onPageGradientChange,
  panel,
  onPanelChange,
}: HubrlBackgroundLayersEditorProps) {
  function goMenu() {
    onPanelChange("menu");
  }

  function patchLayers(partial: Partial<HubrlBackgroundLayersState>) {
    onLayersChange({ ...layers, ...partial });
  }

  return (
    <div className="w-full max-w-full">
      {panel === "menu" ? (
        <>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">{menuTitle}</p>
          {menuDescription ? (
            <p className="mb-3 px-1 text-xs leading-relaxed text-fg-muted">{menuDescription}</p>
          ) : null}
          <div className="grid gap-2" role="group" aria-label="Camadas de fundo">
            {layerRow(
              layers,
              onLayersChange,
              idPrefix,
              "image",
              layers.imageOn,
              "Imagem de fundo",
              "Foto ou ilustração em tela cheia.",
              onPanelChange,
            )}
            {layerRow(
              layers,
              onLayersChange,
              idPrefix,
              "solid",
              layers.solidOn,
              "Cor única",
              "Cor uniforme sobre as outras camadas.",
              onPanelChange,
            )}
            {layerRow(
              layers,
              onLayersChange,
              idPrefix,
              "gradient",
              layers.gradientOn,
              "Degradê",
              "Transição entre cores.",
              onPanelChange,
            )}
          </div>
        </>
      ) : null}

      {panel === "image" ? (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
            <p className="m-0 text-sm font-semibold text-fg">Imagem de fundo</p>
            <button
              type="button"
              onClick={goMenu}
              className="btn-secondary inline-flex size-8 shrink-0 items-center justify-center p-0"
              aria-label="Voltar ao menu das camadas"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <LayerActiveWithOpacity idPrefix={idPrefix} layer="image" layers={layers} patchLayers={patchLayers} />
          <ImagePickerFields
            key={`${idPrefix}-bg-${backgroundImageFieldKey}`}
            id={`${idPrefix}-background-image`}
            allowUrl
            allowFile
            imageUrl={backgroundImageUrl}
            onImageUrlChange={onBackgroundImageUrlChange}
            onFileChange={onBackgroundFileChange}
            isUploading={isBackgroundUploading}
          />
        </div>
      ) : null}

      {panel === "solid" ? (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
            <p className="m-0 text-sm font-semibold text-fg">Cor de fundo</p>
            <button
              type="button"
              onClick={goMenu}
              className="btn-secondary inline-flex size-8 shrink-0 items-center justify-center p-0"
              aria-label="Voltar ao menu das camadas"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <LayerActiveWithOpacity idPrefix={idPrefix} layer="solid" layers={layers} patchLayers={patchLayers} />
          <ColorPickerField
            id={`${idPrefix}-background-color`}
            value={backgroundColor}
            onChange={onBackgroundColorChange}
          />
        </div>
      ) : null}

      {panel === "gradient" ? (
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
            <p className="m-0 text-sm font-semibold text-fg">Degradê</p>
            <button
              type="button"
              onClick={goMenu}
              className="btn-secondary inline-flex size-8 shrink-0 items-center justify-center p-0"
              aria-label="Voltar ao menu das camadas"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <LayerActiveWithOpacity idPrefix={idPrefix} layer="gradient" layers={layers} patchLayers={patchLayers} />
          <HubrlGradientEditor
            fieldIdPrefix={`${idPrefix}-gradient`}
            value={pageGradient}
            onChange={onPageGradientChange}
          />
        </div>
      ) : null}
    </div>
  );
}
