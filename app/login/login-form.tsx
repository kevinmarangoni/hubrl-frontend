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
    <form onSubmit={handleCredentialsLogin} className="grid max-w-md gap-4">
      <label htmlFor="email" className="grid gap-1.5 text-sm font-medium text-fg">
        Email
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="input-field"
        />
      </label>

      <label htmlFor="password" className="grid gap-1.5 text-sm font-medium text-fg">
        Senha
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          className="input-field"
        />
      </label>

      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        Entrar com email
      </button>

      <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="btn-secondary w-full">
        Entrar com Google
      </button>

      {errorMessage ? <p className="m-0 text-sm text-danger">{errorMessage}</p> : null}
    </form>
  );
}
