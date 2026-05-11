import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";
import { AutoSignOut } from "./auto-signout";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.backendAccessToken) {
    const response = await backend.get("users/me", session.backendAccessToken, {
      cache: "no-store",
    });

    if (response.ok) {
      redirect("/user");
    }

    if (response.status === 401) {
      return (
        <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-12">
          <SiteChrome />
          <div className="glass-panel p-8">
            <h1 className="mt-0 text-2xl font-bold text-fg">Login</h1>
            <AutoSignOut />
          </div>
        </main>
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-4 py-12">
      <SiteChrome />
      <div className="glass-panel p-8">
        <h1 className="mt-0 text-2xl font-bold text-fg">Login</h1>
        <p className="text-fg-muted">Entre com Google ou Discord. Não usamos email e senha nesta tela.</p>
        <div className="mt-6">
          <Suspense fallback={<p className="m-0 text-sm text-fg-muted">Carregando…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
