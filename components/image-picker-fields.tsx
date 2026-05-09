"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ImagePickerFieldsProps = {
  id: string;
  allowUrl?: boolean;
  allowFile?: boolean;
  imageUrl: string;
  onImageUrlChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  placeholder?: string;
  isUploading?: boolean;
  /** Classes extras no wrapper interno (ex.: dialog escuro). */
  className?: string;
};

/**
 * Campos de URL + arquivo + preview, reutilizados no Popover do ImageSelector
 * e no Dialog do avatar no formulario de criar hubrl.
 */
export function ImagePickerFields({
  id,
  allowUrl = true,
  allowFile = false,
  imageUrl,
  onImageUrlChange,
  onFileChange,
  placeholder = "https://exemplo.com/imagem.jpg",
  isUploading = false,
  className = "",
}: ImagePickerFieldsProps) {
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const localPreview = useMemo(() => {
    if (!localFile) {
      return "";
    }
    return URL.createObjectURL(localFile);
  }, [localFile]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const previewUrl = localPreview || imageUrl.trim();
  const showClear = Boolean(previewUrl || imageUrl.trim());

  const clearImage = () => {
    setLocalFile(null);
    setFileInputKey((k) => k + 1);
    onFileChange?.(null);
    onImageUrlChange?.("");
  };

  return (
    <div
      className={`box-border flex w-full min-w-0 max-w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4 ${className}`}
    >
      <div className="relative h-24 w-24 max-w-full shrink-0 self-start overflow-hidden rounded-xl border border-border bg-surface/30 sm:h-28 sm:w-28">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-xs font-medium text-fg-muted">
            <span className="rounded-md border border-dashed border-border px-2 py-1">img</span>
          </div>
        )}
        {showClear ? (
          <button
            type="button"
            disabled={isUploading}
            onClick={clearImage}
            className="absolute bottom-0.5 end-0.5 z-10 inline-flex size-6 items-center justify-center rounded border border-white/15 bg-black/75 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/90 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-black/80"
            aria-label="Limpar imagem"
          >
            <Trash2 className="size-2.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="grid w-full min-w-0 flex-none gap-3 sm:min-w-0 sm:flex-[1_1_14rem]">
        {allowUrl ? (
          <label htmlFor={id} className="grid min-w-0 gap-1.5 text-sm font-medium text-fg">
            Link da imagem (URL)
            <input
              id={id}
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              value={imageUrl}
              onChange={(event) => {
                setLocalFile(null);
                setFileInputKey((k) => k + 1);
                onImageUrlChange?.(event.target.value);
              }}
              placeholder={placeholder}
              disabled={isUploading}
              className="input-field min-w-0"
            />
            <span className="text-xs font-normal text-fg-muted">
              Aceita endereço completo (http/https ou CDN).
            </span>
          </label>
        ) : null}

        {allowFile ? (
          <label htmlFor={`${id}-file`} className="grid min-w-0 gap-1.5 text-sm font-medium text-fg">
            Upload de arquivo
            <input
              key={fileInputKey}
              id={`${id}-file`}
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setLocalFile(nextFile);
                onFileChange?.(nextFile);
              }}
              className="block w-full min-w-0 max-w-full text-sm text-fg-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent disabled:opacity-50"
            />
          </label>
        ) : null}

        {isUploading ? (
          <p className="m-0 text-xs text-fg-muted">Aguarde o envio terminar.</p>
        ) : null}
      </div>
    </div>
  );
}
