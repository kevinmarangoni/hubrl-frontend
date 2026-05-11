import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";
import { suggestedHandleFromName } from "@/lib/slug-handle";
import { CreateHubrlForm } from "./create-hubrl-form";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export default async function CreateHubrlPage() {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    redirect("/login");
  }

  const response = await backend.get("users/me", session.backendAccessToken, { cache: "no-store" });

  if (!response.ok) {
    redirect("/login");
  }

  const user = (await response.json()) as UserProfile;

  return (
    <main className="mx-auto max-w-lg px-4 py-8 md:px-6">
      <SiteChrome />
      <h1 className="mb-1 text-2xl font-bold text-fg">Criar um Hubrl</h1>
      <p className="mb-6 text-sm text-fg-muted">Monte a página no estilo preview: foto, nome, links e aparência.</p>
      <CreateHubrlForm
        initialData={{
          title: user.name ?? "Meu Hubrl",
          profileImageUrl: user.avatarUrl ?? "",
          handle: suggestedHandleFromName(user.name ?? ""),
          description: "",
        }}
      />
    </main>
  );
}
