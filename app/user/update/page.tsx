import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { EditProfileForm } from "./edit-profile-form";

export default async function UpdateUserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:px-6">
      <SiteChrome />
      <div className="glass-panel p-8">
        <h1 className="mt-0 text-2xl font-bold text-fg">Editar usuario</h1>
        <p className="text-fg-muted">Atualize seu nome para continuar.</p>
        <div className="mt-6">
          <EditProfileForm initialName={session.user.name ?? ""} userId={session.user.id} />
        </div>
      </div>
    </main>
  );
}
