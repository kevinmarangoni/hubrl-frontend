"use client";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ImageSelector } from "@/components/image-selector";
import { handleUnauthorizedResponse } from "@/lib/handle-unauthorized";

type UpdateProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    provider: "local" | "google";
    lastLogin: string | null;
    isFirstLogin: boolean;
  };
};

export function EditProfileForm({ initialName, userId }: { initialName: string; userId: string }) {
  const [name, setName] = useState(initialName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const saveProfileMutation = useMutation({
    mutationFn: async (payload: { name: string; file: File | null }) => {
      const formData = new FormData();
      formData.append("name", payload.name);

      if (payload.file) {
        formData.append("avatar", payload.file);
      }

      const updateResponse = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
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
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4" encType="multipart/form-data">
      <label htmlFor="name" className="grid gap-1.5 text-sm font-medium text-fg">
        Nome
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          required
          className="input-field"
        />
      </label>

      <ImageSelector
        id="avatar"
        label="Avatar"
        allowUrl={false}
        allowFile
        onFileChange={setSelectedFile}
      />

      <button type="submit" disabled={saveProfileMutation.isPending} className="btn-primary w-fit">
        {saveProfileMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
      </button>

      {saveProfileMutation.isError ? (
        <p className="m-0 text-sm text-danger">Nao foi possivel salvar as alteracoes.</p>
      ) : null}
    </form>
  );
}
