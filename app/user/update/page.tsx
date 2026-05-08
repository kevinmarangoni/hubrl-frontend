import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { EditProfileForm } from "./edit-profile-form";

export default async function UpdateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1>Editar usuario</h1>
      <p>Atualize seu nome para continuar.</p>
      <EditProfileForm initialName={session.user.name ?? ""} userId={session.user.id} />
    </main>
  );
}
