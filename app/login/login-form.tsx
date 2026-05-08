"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCredentialsLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/user",
    });

    if (result?.error) {
      setErrorMessage("Falha no login com email/senha.");
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErrorMessage("");
    setIsLoading(true);
    await signIn("google", {
      callbackUrl: "/user",
    });
  }

  return (
    <form onSubmit={handleCredentialsLogin} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
      <label htmlFor="email" style={{ display: "grid", gap: 4 }}>
        Email
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label htmlFor="password" style={{ display: "grid", gap: 4 }}>
        Senha
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
        />
      </label>

      <button type="submit" disabled={isLoading}>
        Entrar com email
      </button>

      <button type="button" onClick={handleGoogleLogin} disabled={isLoading}>
        Entrar com Google
      </button>

      {errorMessage ? <p style={{ color: "crimson" }}>{errorMessage}</p> : null}
    </form>
  );
}
