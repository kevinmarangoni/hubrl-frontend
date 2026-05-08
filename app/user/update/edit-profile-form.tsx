"use client";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    <form
      onSubmit={handleSubmit}
      style={{ display: "grid", gap: 12, maxWidth: 420 }}
      encType="multipart/form-data"
    >
      <label htmlFor="name" style={{ display: "grid", gap: 4 }}>
        Nome
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          required
        />
      </label>

      <label htmlFor="avatar" style={{ display: "grid", gap: 4 }}>
        Avatar
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <button type="submit" disabled={saveProfileMutation.isPending}>
        {saveProfileMutation.isPending ? "Salvando..." : "Salvar alteracoes"}
      </button>

      {saveProfileMutation.isError ? (
        <p style={{ color: "crimson" }}>Nao foi possivel salvar as alteracoes.</p>
      ) : null}
    </form>
  );
}
