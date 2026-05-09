"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { ImagePickerFields } from "./image-picker-fields";

type ImageSelectorProps = {
  id: string;
  label: string;
  allowUrl?: boolean;
  allowFile?: boolean;
  imageUrl?: string;
  onImageUrlChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  placeholder?: string;
  isUploading?: boolean;
};

export function ImageSelector({
  id,
  label,
  allowUrl = true,
  allowFile = false,
  imageUrl = "",
  onImageUrlChange,
  onFileChange,
  placeholder = "https://exemplo.com/imagem.jpg",
  isUploading = false,
}: ImageSelectorProps) {
  const [open, setOpen] = useState(false);

  const previewUrl = useMemo(() => imageUrl.trim(), [imageUrl]);

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>

      <Popover.Root modal={false} open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={isUploading}
            className={`flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2 shadow-sm backdrop-blur-sm transition hover:border-accent/35 disabled:cursor-wait disabled:opacity-70 dark:bg-surface/40 ${
              previewUrl ? "justify-center text-center" : "justify-start text-left"
            }`}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`Preview ${label}`}
                className="size-7 shrink-0 rounded-md border border-border object-cover"
              />
            ) : (
              <span className="grid size-7 shrink-0 place-items-center rounded-md border border-dashed border-border text-xs text-fg-muted">
                img
              </span>
            )}
            <span
              className={`min-w-0 text-sm leading-snug ${previewUrl ? "text-fg" : "text-fg-muted"} ${previewUrl ? "" : "shrink"}`}
            >
              {isUploading ? "Enviando..." : previewUrl ? "Imagem definida" : "URL ou arquivo"}
            </span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="start"
            className="z-[200] w-[min(92vw,380px)] rounded-xl border border-border/80 bg-surface-elevated/95 p-4 shadow-glass backdrop-blur-xl"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <ImagePickerFields
              id={id}
              allowUrl={allowUrl}
              allowFile={allowFile}
              imageUrl={imageUrl}
              onImageUrlChange={onImageUrlChange}
              onFileChange={onFileChange}
              placeholder={placeholder}
              isUploading={isUploading}
            />
            <div className="mt-3 flex justify-end border-t border-border/60 pt-3">
              <Popover.Close asChild>
                <button type="button" className="btn-primary text-sm" disabled={isUploading}>
                  Fechar
                </button>
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
