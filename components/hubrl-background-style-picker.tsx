"use client";

import * as Popover from "@radix-ui/react-popover";
import { Pencil } from "lucide-react";
import { useState } from "react";
import {
  HubrlBackgroundLayersEditor,
  type HubrlBackgroundLayersEditorPanel,
} from "@/components/hubrl-background-layers-editor";
import type { HubrlBackgroundLayersState } from "@/lib/hubrl-background-layers";
import type { HubrlPageGradient } from "@/lib/hubrl-page-gradient";

export type { HubrlBackgroundLayersState } from "@/lib/hubrl-background-layers";

export type HubrlBackgroundStylePickerProps = {
  idPrefix?: string;
  menuTitle?: string;
  triggerAriaLabel?: string;
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
};

export function HubrlBackgroundStylePicker({
  idPrefix = "hubrl-page",
  menuTitle = "Fundo da página",
  triggerAriaLabel = "Estilo de fundo da pagina",
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
}: HubrlBackgroundStylePickerProps) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<HubrlBackgroundLayersEditorPanel>("menu");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setPanel("menu");
    }
  }

  const wide = panel !== "menu";

  return (
    <Popover.Root modal={false} open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-full bg-black/25 text-white shadow-md ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-black/40 hover:ring-white/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label={triggerAriaLabel}
        >
          <Pencil
            className="size-[1.35rem] shrink-0"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.25}
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className={`z-[200] rounded-xl border border-border/80 bg-surface-elevated/95 p-3 shadow-glass backdrop-blur-xl ${
            wide
              ? panel === "gradient"
                ? "w-[min(96vw,480px)] max-h-[min(85vh,640px)] overflow-y-auto"
                : "w-[min(92vw,400px)] max-h-[min(85vh,560px)] overflow-y-auto"
              : "w-[min(92vw,400px)] max-h-[min(80vh,520px)] overflow-y-auto"
          }`}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <HubrlBackgroundLayersEditor
            idPrefix={idPrefix}
            menuTitle={menuTitle}
            menuDescription=""
            layers={layers}
            onLayersChange={onLayersChange}
            backgroundImageUrl={backgroundImageUrl}
            onBackgroundImageUrlChange={onBackgroundImageUrlChange}
            onBackgroundFileChange={onBackgroundFileChange}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={onBackgroundColorChange}
            isBackgroundUploading={isBackgroundUploading}
            backgroundImageFieldKey={backgroundImageFieldKey}
            pageGradient={pageGradient}
            onPageGradientChange={onPageGradientChange}
            panel={panel}
            onPanelChange={setPanel}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
