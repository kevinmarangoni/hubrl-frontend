import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/site-chrome";
import { authOptions } from "@/lib/auth";
import { AutoSignOut } from "./auto-signout";
import { LoginForm } from "./login-form";

const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const response = await fetch(`${backendBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.backendAccessToken}`,
      },
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
        <p className="text-fg-muted">Autentique com email/senha ou Google.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
