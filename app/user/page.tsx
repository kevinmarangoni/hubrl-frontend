import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "../logout-button";

type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  provider: "local" | "google";
  lastLogin: string | null;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  avatarPublicId: string | null;
};

const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const response = await fetch(`${backendBaseUrl}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.backendAccessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  const user = (await response.json()) as UserProfileResponse;

  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>hubrl</h1>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt="Avatar do usuario"
          style={{ width: 72, height: 72, borderRadius: "9999px", objectFit: "cover" }}
        />
      ) : null}
      <p>Usuario: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Provider: {user.provider}</p>
      <p>Last login: {user.lastLogin ?? "sem registro"}</p>
      <p>Primeiro login: {user.isFirstLogin ? "sim" : "nao"}</p>
      <p>Avatar: {user.avatarUrl ? "configurado" : "nao configurado"}</p>
      <p>JWT backend: {session.backendAccessToken ? "recebido" : "ausente"}</p>
      <Link href="/user/update">Editar usuario</Link>
      <LogoutButton />
      <Link href="/login">Ir para login</Link>
    </main>
  );
}
