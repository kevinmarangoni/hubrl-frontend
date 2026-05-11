"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useMemo, useState } from "react";
import {
  HubrlBackgroundLayersEditor,
  type HubrlBackgroundLayersEditorPanel,
} from "@/components/hubrl-background-layers-editor";
import { HubrlBackgroundStylePicker } from "@/components/hubrl-background-style-picker";
import { ImagePickerFields } from "@/components/image-picker-fields";
import {
  clampLayerOpacity,
  DEFAULT_HUBRL_BACKGROUND_LAYERS,
  type HubrlBackgroundLayersState,
} from "@/lib/hubrl-background-layers";
import { handleUnauthorizedResponse } from "@/lib/handle-unauthorized";
import { http } from "@/lib/http";
import {
  computeLinkPillBackgroundStack,
  linkPillBorderRadiusStyle,
} from "@/lib/hubrl-link-pill-preview";
import {
  createDefaultHubrlPageGradient,
  hubrlPageGradientToCss,
  type HubrlPageGradient,
} from "@/lib/hubrl-page-gradient";
import type {
  CreateHubrlFormInitialData,
  HubrlLinkInput,
  ImageUploadSlot,
  LinkCornerShape,
} from "./types";
import {
  cloneLinkForEdit,
  createEmptyLink,
  linkCornerPxFromShape,
  linkUniformCornerPreset,
  mapInitialLinkToInput,
  parseGradientCss,
  safeExternalHref,
} from "./utils";

/** Miniatura do contorno do botão para cada preset de cantos. */
function LinkCornerPresetGlyph({ shape }: { shape: LinkCornerShape }) {
  const borderRadius = shape === "square" ? "3px" : shape === "semi" ? "8px" : "9999px";
  return (
    <span
      aria-hidden
      className="mx-auto block h-3.5 w-11 shrink-0 border-2 border-current bg-transparent"
      style={{ borderRadius }}
    />
  );
}

function LinkPillPreview({
  link,
  className,
  href,
}: {
  link: HubrlLinkInput;
  className?: string;
  /** Definido na lista de links; omitido no exemplo do diálogo (rascunho). */
  href?: string;
}) {
  const stack = computeLinkPillBackgroundStack({
    backgroundColor: link.backgroundColor,
    backgroundImageUrl: link.backgroundImageUrl,
    linkBackgroundLayers: link.linkBackgroundLayers,
    linkGradient: link.linkGradient,
  });
  const dim = stack.hasImage;
  const br = linkPillBorderRadiusStyle({
    topLeft: link.borderRadiusTopLeftPx,
    topRight: link.borderRadiusTopRightPx,
    bottomRight: link.borderRadiusBottomRightPx,
    bottomLeft: link.borderRadiusBottomLeftPx,
  });
  const clampOpacity = stack.clampOpacity;

  const outerClassName = `relative flex min-h-[48px] w-full items-stretch overflow-hidden border-2 border-white/85 shadow-sm backdrop-blur-sm ${
    href
      ? "cursor-pointer text-inherit no-underline outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent "
      : ""
  }${className ?? ""}`;

  const inner = (
    <>
      <div className="absolute inset-0 z-0" aria-hidden>
        {stack.showBase ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(165deg, #4c1d95 0%, #6d28d9 45%, #c084fc 100%)",
            }}
          />
        ) : null}
        {stack.hasImage ? (
          <div
            className="absolute inset-0"
            style={{
              opacity: clampOpacity(link.linkBackgroundLayers.imageOpacity) / 100,
              backgroundImage: `url(${stack.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : null}
        {stack.hasGradient ? (
          <div
            className="absolute inset-0"
            style={{
              opacity: clampOpacity(link.linkBackgroundLayers.gradientOpacity) / 100,
              backgroundImage: stack.gradientCss,
            }}
          />
        ) : null}
        {stack.hasSolid ? (
          <div
            className="absolute inset-0"
            style={{
              opacity: clampOpacity(link.linkBackgroundLayers.solidOpacity) / 100,
              backgroundColor: stack.c,
            }}
          />
        ) : null}
      </div>
      {dim ? <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" aria-hidden /> : null}
      <div className="relative z-10 flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-white">
        {link.avatarImageUrl.trim() ? (
          <img
            src={link.avatarImageUrl.trim()}
            alt=""
            className="size-8 shrink-0 rounded-full border-2 border-white/55 object-cover shadow-sm"
          />
        ) : null}
        <span className="min-w-0 flex-1 text-center text-sm font-semibold drop-shadow-sm">{link.text}</span>
        {link.isAdultOnly ? (
          <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            18+
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={outerClassName}
        style={{ borderRadius: br }}
        aria-label={`Abrir link: ${link.text}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={outerClassName} style={{ borderRadius: br }}>
      {inner}
    </div>
  );
}

export function CreateHubrlForm({ initialData }: { initialData: CreateHubrlFormInitialData }) {
  const isEditMode = Boolean(initialData.hubrlId?.trim());
  const [title, setTitle] = useState(initialData.title);
  const [handle, setHandle] = useState(initialData.handle);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState(initialData.profileImageUrl);
  const [pageBackgroundColor, setPageBackgroundColor] = useState(initialData.backgroundColor ?? "");
  const [pageBackgroundImageUrl, setPageBackgroundImageUrl] = useState(initialData.backgroundImageUrl ?? "");
  const [pageBackgroundLayers, setPageBackgroundLayers] = useState<HubrlBackgroundLayersState>(() => {
    if (initialData.backgroundLayers) {
      return { ...initialData.backgroundLayers };
    }
    return {
      imageOn: Boolean(initialData.backgroundImageLayerOn),
      imageOpacity: clampLayerOpacity(initialData.backgroundImageLayerOpacity ?? 100),
      solidOn: Boolean(initialData.backgroundSolidLayerOn),
      solidOpacity: clampLayerOpacity(initialData.backgroundSolidLayerOpacity ?? 100),
      gradientOn:
        initialData.backgroundGradientLayerOn === undefined
          ? DEFAULT_HUBRL_BACKGROUND_LAYERS.gradientOn
          : Boolean(initialData.backgroundGradientLayerOn),
      gradientOpacity: clampLayerOpacity(initialData.backgroundGradientLayerOpacity ?? 100),
    };
  });
  const [pageBackgroundGradient, setPageBackgroundGradient] = useState<HubrlPageGradient>(() =>
    parseGradientCss(initialData.backgroundGradientCss),
  );
  const [cardBackgroundColor, setCardBackgroundColor] = useState(
    initialData.cardBackgroundColor ?? initialData.backgroundColor ?? "",
  );
  const [cardBackgroundImageUrl, setCardBackgroundImageUrl] = useState(
    initialData.cardBackgroundImageUrl ?? initialData.backgroundImageUrl ?? "",
  );
  const [cardBackgroundLayers, setCardBackgroundLayers] = useState<HubrlBackgroundLayersState>(() => ({
    imageOn:
      initialData.cardBackgroundImageLayerOn !== undefined
        ? Boolean(initialData.cardBackgroundImageLayerOn)
        : Boolean(initialData.backgroundImageLayerOn),
    imageOpacity: clampLayerOpacity(
      initialData.cardBackgroundImageLayerOpacity ?? initialData.backgroundImageLayerOpacity ?? 100,
    ),
    solidOn:
      initialData.cardBackgroundSolidLayerOn !== undefined
        ? Boolean(initialData.cardBackgroundSolidLayerOn)
        : Boolean(initialData.backgroundSolidLayerOn),
    solidOpacity: clampLayerOpacity(
      initialData.cardBackgroundSolidLayerOpacity ?? initialData.backgroundSolidLayerOpacity ?? 100,
    ),
    gradientOn:
      initialData.cardBackgroundGradientLayerOn !== undefined
        ? Boolean(initialData.cardBackgroundGradientLayerOn)
        : initialData.backgroundGradientLayerOn === undefined
          ? DEFAULT_HUBRL_BACKGROUND_LAYERS.gradientOn
          : Boolean(initialData.backgroundGradientLayerOn),
    gradientOpacity: clampLayerOpacity(
      initialData.cardBackgroundGradientLayerOpacity ?? initialData.backgroundGradientLayerOpacity ?? 100,
    ),
  }));
  const [cardBackgroundGradient, setCardBackgroundGradient] = useState<HubrlPageGradient>(() =>
    parseGradientCss(initialData.cardBackgroundGradientCss ?? initialData.backgroundGradientCss),
  );
  const [links, setLinks] = useState<HubrlLinkInput[]>(() => initialData.links?.map(mapInitialLinkToInput) ?? []);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [profileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [draftLink, setDraftLink] = useState<HubrlLinkInput>(() => createEmptyLink());
  const [linkEditorPanel, setLinkEditorPanel] = useState<HubrlBackgroundLayersEditorPanel>("menu");
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const router = useRouter();

  const [activeImageUpload, setActiveImageUpload] = useState<ImageUploadSlot | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [profileImageKey, setProfileImageKey] = useState(0);
  const [pageBackgroundImageKey, setPageBackgroundImageKey] = useState(0);
  const [cardBackgroundImageKey, setCardBackgroundImageKey] = useState(0);
  const [draftAvatarKey, setDraftAvatarKey] = useState(0);
  const [draftBgKey, setDraftBgKey] = useState(0);

  const profilePreviewSrc = profileImageUrl.trim();
  const draftLinkIdPrefix = "hubrl-link-draft";

  const pageBg = useMemo(() => {
    const img = pageBackgroundImageUrl.trim();
    const c = pageBackgroundColor.trim();
    const validHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);
    const hasImage =
      pageBackgroundLayers.imageOn && img.length > 0 && pageBackgroundLayers.imageOpacity > 0;
    const hasGradient = pageBackgroundLayers.gradientOn && pageBackgroundLayers.gradientOpacity > 0;
    const hasSolid = pageBackgroundLayers.solidOn && validHex && pageBackgroundLayers.solidOpacity > 0;
    const showBase = !hasImage && !hasGradient && !hasSolid;
    return {
      img,
      c,
      hasImage,
      hasGradient,
      hasSolid,
      showBase,
      gradientCss: hubrlPageGradientToCss(pageBackgroundGradient),
    };
  }, [pageBackgroundColor, pageBackgroundImageUrl, pageBackgroundLayers, pageBackgroundGradient]);

  const heroBg = useMemo(() => {
    const img = cardBackgroundImageUrl.trim();
    const c = cardBackgroundColor.trim();
    const validHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c);
    const hasImage = cardBackgroundLayers.imageOn && img.length > 0 && cardBackgroundLayers.imageOpacity > 0;
    const hasGradient = cardBackgroundLayers.gradientOn && cardBackgroundLayers.gradientOpacity > 0;
    const hasSolid = cardBackgroundLayers.solidOn && validHex && cardBackgroundLayers.solidOpacity > 0;
    const showBase = !hasImage && !hasGradient && !hasSolid;
    return {
      img,
      c,
      hasImage,
      hasGradient,
      hasSolid,
      showBase,
      gradientCss: hubrlPageGradientToCss(cardBackgroundGradient),
    };
  }, [cardBackgroundColor, cardBackgroundImageUrl, cardBackgroundLayers, cardBackgroundGradient]);

  const showImageDim = heroBg.hasImage;

  const uploadHubrlImage = useCallback(
    async (slot: ImageUploadSlot, file: File | null) => {
      if (!file) {
        return;
      }

      setImageUploadError(null);
      setActiveImageUpload(slot);

      if (slot === "profile") {
        setProfileImageUrl("");
      } else if (slot === "pageBackground") {
        setPageBackgroundImageUrl("");
      } else if (slot === "cardBackground") {
        setCardBackgroundImageUrl("");
      } else if (slot === "draftAvatar") {
        setDraftLink((current) => ({ ...current, avatarImageUrl: "" }));
      } else {
        setDraftLink((current) => ({ ...current, backgroundImageUrl: "" }));
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await http.post("/api/hubrls/upload-image", {
          body: formData,
        });

        if (await handleUnauthorizedResponse(response)) {
          return;
        }

        const data = (await response.json()) as { message?: string; url?: string };

        if (!response.ok) {
          throw new Error(typeof data.message === "string" ? data.message : "Falha no envio da imagem");
        }

        if (!data.url) {
          throw new Error("Resposta invalida do servidor");
        }

        if (slot === "profile") {
          setProfileImageUrl(data.url);
          setProfileImageKey((k) => k + 1);
        } else if (slot === "pageBackground") {
          setPageBackgroundImageUrl(data.url);
          setPageBackgroundImageKey((k) => k + 1);
        } else if (slot === "cardBackground") {
          setCardBackgroundImageUrl(data.url);
          setCardBackgroundImageKey((k) => k + 1);
        } else if (slot === "draftAvatar") {
          setDraftLink((current) => ({ ...current, avatarImageUrl: data.url! }));
          setDraftAvatarKey((k) => k + 1);
        } else {
          setDraftLink((current) => ({ ...current, backgroundImageUrl: data.url! }));
          setDraftBgKey((k) => k + 1);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Falha no envio da imagem";
        setImageUploadError(message);
      } finally {
        setActiveImageUpload(null);
      }
    },
    [],
  );

  const createHubrlMutation = useMutation({
    mutationFn: async () => {
      const handleBody = handle.replace(/^@+/g, "").trim();
      const url = isEditMode ? `/api/hubrls/${encodeURIComponent(initialData.hubrlId!.trim())}` : "/api/hubrls";
      const json = {
          title: title.trim(),
          handle: handleBody.length ? handleBody : undefined,
          description: description.trim() || undefined,
          profileImageUrl: profileImageUrl.trim(),
          backgroundColor: pageBackgroundColor.trim(),
          backgroundImageUrl: pageBackgroundImageUrl.trim(),
          backgroundGradientCss: hubrlPageGradientToCss(pageBackgroundGradient),
          backgroundImageLayerOn: pageBackgroundLayers.imageOn,
          backgroundImageLayerOpacity: clampLayerOpacity(pageBackgroundLayers.imageOpacity),
          backgroundSolidLayerOn: pageBackgroundLayers.solidOn,
          backgroundSolidLayerOpacity: clampLayerOpacity(pageBackgroundLayers.solidOpacity),
          backgroundGradientLayerOn: pageBackgroundLayers.gradientOn,
          backgroundGradientLayerOpacity: clampLayerOpacity(pageBackgroundLayers.gradientOpacity),
          cardBackgroundColor: cardBackgroundColor.trim(),
          cardBackgroundImageUrl: cardBackgroundImageUrl.trim(),
          cardBackgroundGradientCss: hubrlPageGradientToCss(cardBackgroundGradient),
          cardBackgroundImageLayerOn: cardBackgroundLayers.imageOn,
          cardBackgroundImageLayerOpacity: clampLayerOpacity(cardBackgroundLayers.imageOpacity),
          cardBackgroundSolidLayerOn: cardBackgroundLayers.solidOn,
          cardBackgroundSolidLayerOpacity: clampLayerOpacity(cardBackgroundLayers.solidOpacity),
          cardBackgroundGradientLayerOn: cardBackgroundLayers.gradientOn,
          cardBackgroundGradientLayerOpacity: clampLayerOpacity(cardBackgroundLayers.gradientOpacity),
          links: links.map((link) => ({
            avatarImageUrl: link.avatarImageUrl.trim(),
            backgroundColor: link.backgroundColor.trim(),
            backgroundImageUrl: link.backgroundImageUrl.trim(),
            backgroundGradientCss: hubrlPageGradientToCss(link.linkGradient),
            backgroundImageLayerOn: link.linkBackgroundLayers.imageOn,
            backgroundImageLayerOpacity: clampLayerOpacity(link.linkBackgroundLayers.imageOpacity),
            backgroundSolidLayerOn: link.linkBackgroundLayers.solidOn,
            backgroundSolidLayerOpacity: clampLayerOpacity(link.linkBackgroundLayers.solidOpacity),
            backgroundGradientLayerOn: link.linkBackgroundLayers.gradientOn,
            backgroundGradientLayerOpacity: clampLayerOpacity(link.linkBackgroundLayers.gradientOpacity),
            borderRadiusTopLeftPx: link.borderRadiusTopLeftPx,
            borderRadiusTopRightPx: link.borderRadiusTopRightPx,
            borderRadiusBottomRightPx: link.borderRadiusBottomRightPx,
            borderRadiusBottomLeftPx: link.borderRadiusBottomLeftPx,
            text: link.text.trim(),
            url: link.url.trim(),
            isAdultOnly: link.isAdultOnly,
            ...(link.linkId?.trim() ? { linkId: link.linkId.trim() } : {}),
          })),
      };
      const response = isEditMode
        ? await http.patch(url, { json })
        : await http.post(url, { json });

      if (await handleUnauthorizedResponse(response)) {
        throw new Error("Sessao expirada");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? (isEditMode ? "Falha ao atualizar hubrl" : "Falha ao criar hubrl"));
      }
      return data;
    },
    onSuccess: () => {
      router.push("/user");
      router.refresh();
    },
  });

  const isValidDraft = useMemo(
    () => Boolean(draftLink.text.trim()) && Boolean(draftLink.url.trim()),
    [draftLink.text, draftLink.url],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || activeImageUpload) {
      return;
    }

    createHubrlMutation.mutate();
  }

  function saveDraftLink() {
    if (!isValidDraft) {
      return;
    }

    if (editingLinkIndex !== null) {
      setLinks((current) =>
        current.map((item, i) => (i === editingLinkIndex ? draftLink : item)),
      );
      setEditingLinkIndex(null);
    } else {
      setLinks((current) => [...current, draftLink]);
    }

    setDraftLink(createEmptyLink());
    setDraftAvatarKey((k) => k + 1);
    setDraftBgKey((k) => k + 1);
    setLinkEditorPanel("menu");
    setIsLinkDialogOpen(false);
  }

  function removeLink(index: number) {
    setLinks((current) => current.filter((_, i) => i !== index));
  }

  function openEditLink(index: number) {
    setEditingLinkIndex(index);
    setDraftLink(cloneLinkForEdit(links[index]));
    setLinkEditorPanel("menu");
    setDraftAvatarKey((k) => k + 1);
    setDraftBgKey((k) => k + 1);
    setIsLinkDialogOpen(true);
  }

  function onHandleInput(raw: string) {
    const cleaned = raw.replace(/@/g, "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
    setHandle(cleaned);
  }

  const pillClass =
    "flex w-full min-h-[48px] items-center justify-center rounded-full border-2 border-white/85 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/15";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md pb-8">
      {imageUploadError ? (
        <p className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {imageUploadError}
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-black/20">
        <div className="absolute inset-0 z-0" aria-hidden>
          {pageBg.showBase ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(165deg, #0f172a 0%, #111827 42%, #312e81 100%)",
              }}
            />
          ) : null}
          {pageBg.hasImage ? (
            <div
              className="absolute inset-0"
              style={{
                opacity: clampLayerOpacity(pageBackgroundLayers.imageOpacity) / 100,
                backgroundImage: `url(${pageBg.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          ) : null}
          {pageBg.hasGradient ? (
            <div
              className="absolute inset-0"
              style={{
                opacity: clampLayerOpacity(pageBackgroundLayers.gradientOpacity) / 100,
                backgroundImage: pageBg.gradientCss,
              }}
            />
          ) : null}
          {pageBg.hasSolid ? (
            <div
              className="absolute inset-0"
              style={{
                opacity: clampLayerOpacity(pageBackgroundLayers.solidOpacity) / 100,
                backgroundColor: pageBg.c,
              }}
            />
          ) : null}
        </div>
        <HubrlBackgroundStylePicker
          idPrefix="hubrl-page-bg"
          menuTitle="Fundo da página"
          triggerAriaLabel="Editar fundo da pagina"
          layers={pageBackgroundLayers}
          onLayersChange={setPageBackgroundLayers}
          backgroundImageUrl={pageBackgroundImageUrl}
          onBackgroundImageUrlChange={setPageBackgroundImageUrl}
          onBackgroundFileChange={(file) => {
            void uploadHubrlImage("pageBackground", file);
          }}
          backgroundColor={pageBackgroundColor}
          onBackgroundColorChange={setPageBackgroundColor}
          isBackgroundUploading={activeImageUpload === "pageBackground"}
          backgroundImageFieldKey={pageBackgroundImageKey}
          pageGradient={pageBackgroundGradient}
          onPageGradientChange={setPageBackgroundGradient}
        />
        <div className="relative z-10 px-4 pb-5 pt-12 sm:px-5">
          <div className="relative mx-auto flex w-full max-w-[22.5rem] min-h-[420px] flex-col items-center overflow-hidden rounded-[2rem] border border-white/25 px-6 pb-10 pt-12 shadow-2xl shadow-black/25">
            <div className="absolute inset-0 z-0" aria-hidden>
              {heroBg.showBase ? (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(165deg, #4c1d95 0%, #6d28d9 45%, #c084fc 100%)",
                  }}
                />
              ) : null}
              {heroBg.hasImage ? (
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: clampLayerOpacity(cardBackgroundLayers.imageOpacity) / 100,
                    backgroundImage: `url(${heroBg.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              ) : null}
              {heroBg.hasGradient ? (
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: clampLayerOpacity(cardBackgroundLayers.gradientOpacity) / 100,
                    backgroundImage: heroBg.gradientCss,
                  }}
                />
              ) : null}
              {heroBg.hasSolid ? (
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: clampLayerOpacity(cardBackgroundLayers.solidOpacity) / 100,
                    backgroundColor: heroBg.c,
                  }}
                />
              ) : null}
            </div>
            {showImageDim ? (
              <div className="pointer-events-none absolute inset-0 z-[1] bg-black/35" aria-hidden />
            ) : null}
            <HubrlBackgroundStylePicker
              idPrefix="hubrl-card-bg"
              menuTitle="Fundo do card"
              triggerAriaLabel="Editar fundo do card"
              layers={cardBackgroundLayers}
              onLayersChange={setCardBackgroundLayers}
              backgroundImageUrl={cardBackgroundImageUrl}
              onBackgroundImageUrlChange={setCardBackgroundImageUrl}
              onBackgroundFileChange={(file) => {
                void uploadHubrlImage("cardBackground", file);
              }}
              backgroundColor={cardBackgroundColor}
              onBackgroundColorChange={setCardBackgroundColor}
              isBackgroundUploading={activeImageUpload === "cardBackground"}
              backgroundImageFieldKey={cardBackgroundImageKey}
              pageGradient={cardBackgroundGradient}
              onPageGradientChange={setCardBackgroundGradient}
            />
            <div className="relative z-10 flex w-full flex-col items-center">
            <Dialog.Root open={profileImageModalOpen} onOpenChange={setProfileImageModalOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  disabled={activeImageUpload === "profile"}
                  className="group relative size-[7.5rem] shrink-0 overflow-hidden rounded-full border-[5px] border-white/50 bg-white/10 shadow-lg ring-2 ring-white/25 transition hover:border-white/80 hover:ring-white/40 disabled:opacity-60"
                  aria-label="Alterar foto de perfil do hubrl"
                >
                  {profilePreviewSrc ? (
                    <img
                      src={profilePreviewSrc}
                      alt="Foto do hubrl"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-4xl font-light text-white/60">
                      +
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    Alterar foto
                  </span>
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[240] bg-black/50 backdrop-blur-sm" />
                <Dialog.Content
                  className="glass-panel fixed left-1/2 top-1/2 z-[250] grid max-h-[90vh] w-[min(92vw,400px)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto p-6"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Dialog.Title className="m-0 text-lg font-semibold text-fg">Foto do perfil</Dialog.Title>
                  <p className="m-0 text-sm text-fg-muted">
                    Cole um link ou envie um arquivo. A imagem aparece no topo do hubrl.
                  </p>

                  <ImagePickerFields
                    key={`profile-modal-${profileImageKey}`}
                    id="profile-image-modal"
                    allowUrl
                    allowFile
                    imageUrl={profileImageUrl}
                    onImageUrlChange={setProfileImageUrl}
                    isUploading={activeImageUpload === "profile"}
                    onFileChange={(file) => {
                      void uploadHubrlImage("profile", file);
                    }}
                  />

                  <div className="flex justify-end gap-2 border-t border-border/60 pt-2">
                    <Dialog.Close asChild>
                      <button type="button" className="btn-primary text-sm" disabled={activeImageUpload === "profile"}>
                        Pronto
                      </button>
                    </Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <div className="mt-5 w-full max-w-xs">
              <label htmlFor="hubrl-title" className="sr-only">
                Nome do hubrl
              </label>
              <input
                id="hubrl-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Seu nome"
                className="w-full border-0 border-b border-white/35 bg-transparent pb-1 text-center text-2xl font-bold text-white placeholder:text-white/45 outline-none focus:border-white/70 focus:ring-0"
              />
            </div>

            <div className="mt-3 w-full max-w-xs">
              <label htmlFor="hubrl-handle" className="sr-only">
                Nome de usuario (handle)
              </label>
              <div className="flex items-center justify-center gap-1 border-b border-white/35 pb-1">
                <span className="shrink-0 text-lg font-medium text-white/90">@</span>
                <input
                  id="hubrl-handle"
                  value={handle}
                  onChange={(event) => onHandleInput(event.target.value)}
                  placeholder="seuidentificador"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 border-0 bg-transparent text-center text-lg font-medium text-white placeholder:text-white/45 outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="mt-4 w-full max-w-xs">
              <label htmlFor="hubrl-description" className="sr-only">
                Descricao
              </label>
              <textarea
                id="hubrl-description"
                value={description}
                onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                rows={3}
                maxLength={500}
                placeholder="Um pouco sobre você..."
                className="w-full resize-none rounded-xl border border-white/30 bg-black/15 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/45 outline-none focus:ring-2 focus:ring-white/35"
              />
            </div>

            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              {links.map((link, index) => (
                <div
                  key={`link-row-${index}`}
                  className="group relative w-full"
                >
                  <LinkPillPreview link={link} href={safeExternalHref(link.url)} />
                  <div
                    role="toolbar"
                    aria-label={`Ações do link ${link.text}`}
                    className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-white/45 bg-black/65 px-1 py-1 opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 ease-out pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100"
                  >
                    <button
                      type="button"
                      onClick={() => openEditLink(index)}
                      className="flex size-8 items-center justify-center rounded-md border border-transparent text-white transition hover:border-white/35 hover:bg-white/15"
                      aria-label={`Editar link ${link.text}`}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="flex size-8 items-center justify-center rounded-md border border-transparent text-lg font-light leading-none text-white transition hover:border-white/35 hover:bg-white/15"
                      aria-label={`Remover link ${link.text}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <Dialog.Root
                open={isLinkDialogOpen}
                onOpenChange={(open) => {
                  setIsLinkDialogOpen(open);
                  if (!open) {
                    setEditingLinkIndex(null);
                    setLinkEditorPanel("menu");
                  }
                }}
              >
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    className={pillClass}
                    onClick={() => {
                      setEditingLinkIndex(null);
                      setDraftLink(createEmptyLink());
                      setLinkEditorPanel("menu");
                      setDraftAvatarKey((k) => k + 1);
                      setDraftBgKey((k) => k + 1);
                    }}
                  >
                    + Adicionar link
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
                  <Dialog.Content className="glass-panel fixed left-1/2 top-1/2 z-50 grid max-h-[90vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto p-6">
                    <Dialog.Title className="m-0 text-lg font-semibold text-fg">
                      {editingLinkIndex !== null ? "Editar link" : "Novo link"}
                    </Dialog.Title>

                    <div className="grid gap-3">
                      <label className="grid gap-1.5 text-sm font-medium text-fg">
                        Texto do botao
                        <input
                          type="text"
                          placeholder="Ex.: Consulta online"
                          value={draftLink.text}
                          onChange={(event) =>
                            setDraftLink((current) => ({ ...current, text: event.target.value }))
                          }
                          className="input-field"
                        />
                      </label>
                      <label className="grid gap-1.5 text-sm font-medium text-fg">
                        Endereco do link
                        <input
                          type="text"
                          inputMode="url"
                          placeholder="https://..."
                          value={draftLink.url}
                          onChange={(event) =>
                            setDraftLink((current) => ({ ...current, url: event.target.value }))
                          }
                          className="input-field"
                        />
                      </label>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-surface/40 p-4">
                      <p className="mb-2 text-xs font-medium text-fg-muted">Exemplo</p>
                      <div
                        className="rounded-lg p-3"
                        style={{
                          backgroundImage:
                            "linear-gradient(165deg, #4c1d95 0%, #6d28d9 45%, #c084fc 100%)",
                        }}
                      >
                        <LinkPillPreview
                          link={{
                            ...draftLink,
                            text: draftLink.text.trim() ? draftLink.text : "Texto do botão",
                          }}
                        />
                      </div>
                    </div>

                    <fieldset className="m-0 border-0 p-0">
                      <legend className="mb-2 text-xs font-medium text-fg-muted">Cantos do botão</legend>
                      <div
                        className="grid grid-cols-3 gap-2"
                        role="group"
                        aria-label="Arredondamento dos cantos"
                      >
                        {(
                          [
                            { shape: "square" as const, label: "Quadrado" },
                            { shape: "semi" as const, label: "Semi" },
                            { shape: "circular" as const, label: "Circular" },
                          ] as const
                        ).map(({ shape, label }) => {
                          const px = linkCornerPxFromShape(shape);
                          const active = linkUniformCornerPreset(draftLink) === shape;
                          return (
                            <button
                              key={shape}
                              type="button"
                              onClick={() =>
                                setDraftLink((c) => ({
                                  ...c,
                                  borderRadiusTopLeftPx: px,
                                  borderRadiusTopRightPx: px,
                                  borderRadiusBottomRightPx: px,
                                  borderRadiusBottomLeftPx: px,
                                }))
                              }
                              aria-pressed={active}
                              className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-center text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                                active
                                  ? "border-accent/70 bg-accent/12 text-fg ring-1 ring-accent/25"
                                  : "border-border/55 bg-surface/45 text-fg-muted hover:border-border hover:bg-surface/70 hover:text-fg"
                              }`}
                            >
                              <LinkCornerPresetGlyph shape={shape} />
                              <span className="leading-tight">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="grid gap-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-wide text-fg-muted">Avatar (opcional)</p>
                      <ImagePickerFields
                        key={`draft-av-${draftAvatarKey}`}
                        id={`${draftLinkIdPrefix}-avatar`}
                        allowUrl
                        allowFile
                        imageUrl={draftLink.avatarImageUrl}
                        onImageUrlChange={(value) =>
                          setDraftLink((current) => ({ ...current, avatarImageUrl: value }))
                        }
                        isUploading={activeImageUpload === "draftAvatar"}
                        onFileChange={(file) => {
                          void uploadHubrlImage("draftAvatar", file);
                        }}
                      />
                    </div>

                    <HubrlBackgroundLayersEditor
                      idPrefix={draftLinkIdPrefix}
                      menuTitle="Fundo do botão"
                      menuDescription="Combine imagem, cor e degradê como no fundo da página. Opacidade e restantes ajustes ficam ao abrir cada camada (engrenagem)."
                      layers={draftLink.linkBackgroundLayers}
                      onLayersChange={(next) =>
                        setDraftLink((current) => ({ ...current, linkBackgroundLayers: next }))
                      }
                      backgroundImageUrl={draftLink.backgroundImageUrl}
                      onBackgroundImageUrlChange={(v) =>
                        setDraftLink((current) => ({ ...current, backgroundImageUrl: v }))
                      }
                      onBackgroundFileChange={(file) => {
                        void uploadHubrlImage("draftBg", file);
                      }}
                      backgroundColor={draftLink.backgroundColor}
                      onBackgroundColorChange={(v) =>
                        setDraftLink((current) => ({ ...current, backgroundColor: v }))
                      }
                      isBackgroundUploading={activeImageUpload === "draftBg"}
                      backgroundImageFieldKey={draftBgKey}
                      pageGradient={draftLink.linkGradient}
                      onPageGradientChange={(next) =>
                        setDraftLink((current) => ({ ...current, linkGradient: next }))
                      }
                      panel={linkEditorPanel}
                      onPanelChange={setLinkEditorPanel}
                    />

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                      <input
                        type="checkbox"
                        checked={draftLink.isAdultOnly}
                        onChange={(event) =>
                          setDraftLink((current) => ({ ...current, isAdultOnly: event.target.checked }))
                        }
                        className="size-4 rounded border-border text-accent focus:ring-accent/30"
                      />
                      Conteudo improprio para menores
                    </label>

                    <div className="flex justify-end gap-2 pt-2">
                      <Dialog.Close asChild>
                        <button type="button" className="btn-secondary text-sm">
                          Cancelar
                        </button>
                      </Dialog.Close>
                      <button
                        type="button"
                        disabled={!isValidDraft || activeImageUpload !== null}
                        onClick={saveDraftLink}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {editingLinkIndex !== null ? "Guardar" : "Adicionar"}
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="mt-8 w-full">
        <button
          type="submit"
          disabled={createHubrlMutation.isPending || activeImageUpload !== null}
          className="btn-primary w-full rounded-full py-3.5 text-base font-semibold shadow-glow disabled:opacity-50"
        >
          {createHubrlMutation.isPending ? (isEditMode ? "Salvando..." : "Criando...") : isEditMode ? "Salvar Hubrl" : "Criar Hubrl"}
        </button>

        {createHubrlMutation.isError ? (
          <p className="mt-3 text-center text-sm text-danger">
            {isEditMode ? "Nao foi possivel atualizar o hubrl." : "Nao foi possivel criar o hubrl."}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export type { CreateHubrlFormInitialData, HubrlLinkInput } from "./types";
