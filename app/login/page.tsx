import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/user");
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <h1>Login</h1>
      <p>Autentique com email/senha ou Google.</p>
      <LoginForm />
    </main>
  );
}
