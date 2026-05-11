"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ImageSelector } from "@/components/image-selector";
import { handleUnauthorizedResponse } from "@/lib/handle-unauthorized";
import { http } from "@/lib/http";
import type { EditProfileFormProps, UpdateProfileResponse } from "./types";

export function EditProfileForm({
  initialName,
  initialEmail,
  initialAvatarUrl,
  userId,
}: EditProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const avatarDisplayUrl = filePreviewUrl ?? initialAvatarUrl?.trim() ?? "";

  const saveProfileMutation = useMutation({
    mutationFn: async (payload: { name: string; file: File | null }) => {
      const formData = new FormData();
      formData.append("name", payload.name);

      if (payload.file) {
        formData.append("avatar", payload.file);
      }

      const updateResponse = await http.patch(`/api/users/${userId}`, {
        body: formData,
      });

      if (await handleUnauthorizedResponse(updateResponse)) {
        throw new Error("Sessao expirada");
      }

      const updateData = (await updateResponse.json()) as UpdateProfileResponse;

      if (!updateResponse.ok) {
        throw new Error("Falha ao atualizar perfil");
      }

      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/user");
      router.refresh();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    saveProfileMutation.mutate({ name: trimmedName, file: selectedFile });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8" encType="multipart/form-data">
      <section className="rounded-2xl border border-border/60 bg-surface/25 p-5 md:p-6">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-fg-muted">Dados da conta</h2>
        <p className="m-0 mt-1 text-xs text-fg-muted">O email não pode ser alterado aqui.</p>
        <div className="mt-5 grid gap-5">
          <label htmlFor="profile-email" className="grid gap-1.5 text-sm font-medium text-fg">
            Email
            <input
              id="profile-email"
              type="email"
              readOnly
              value={initialEmail}
              className="input-field cursor-not-allowed opacity-90"
              autoComplete="email"
            />
          </label>
          <label htmlFor="name" className="grid gap-1.5 text-sm font-medium text-fg">
            Nome público
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
              className="input-field"
              placeholder="Como quer ser chamado"
              autoComplete="name"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-surface/25 p-5 md:p-6">
        <h2 className="m-0 text-sm font-semibold uppercase tracking-wider text-fg-muted">Foto de perfil</h2>
        <p className="m-0 mt-1 text-xs text-fg-muted">PNG ou JPG até 5 MB. Substitui a imagem atual ao guardar.</p>
        <div className="mt-5 max-w-md">
          <ImageSelector
            id="avatar"
            label="Alterar imagem"
            allowUrl={false}
            allowFile
            imageUrl={avatarDisplayUrl}
            onFileChange={setSelectedFile}
            isUploading={saveProfileMutation.isPending}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <button type="submit" disabled={saveProfileMutation.isPending} className="btn-primary">
          {saveProfileMutation.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
        <Link href="/user" className="btn-secondary no-underline">
          Cancelar
        </Link>
      </div>

      {saveProfileMutation.isError ? (
        <p className="m-0 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
          Não foi possível salvar as alterações. Tente novamente.
        </p>
      ) : null}
    </form>
  );
}
