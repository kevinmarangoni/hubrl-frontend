import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

type BackendAuthResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    provider: "local" | "google";
    lastLogin: string | null;
    isFirstLogin: boolean;
    avatarUrl: string | null;
    avatarPublicId: string | null;
  };
};

const backendBaseUrl =
  process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const response = await fetch(`${backendBaseUrl}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as BackendAuthResponse;

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          provider: data.user.provider,
          lastLogin: data.user.lastLogin,
          isFirstLogin: data.user.isFirstLogin,
          avatarUrl: data.user.avatarUrl,
          avatarPublicId: data.user.avatarPublicId,
          backendAccessToken: data.accessToken,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email ?? profile?.email;
      const name = user.name ?? profile?.name;
      // Backend atual valida apenas prefixo "google_".
      const googleToken = `google_${account.providerAccountId ?? "oauth"}`;

      if (!email || !name || !googleToken) {
        return false;
      }

      const response = await fetch(`${backendBaseUrl}/users/login/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          googleToken,
          email,
          name,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as BackendAuthResponse;
      user.id = data.user.id;
      user.email = data.user.email;
      user.name = data.user.name;
      user.provider = data.user.provider;
      user.lastLogin = data.user.lastLogin;
      user.isFirstLogin = data.user.isFirstLogin;
      user.avatarUrl = data.user.avatarUrl;
      user.avatarPublicId = data.user.avatarPublicId;
      user.backendAccessToken = data.accessToken;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.provider = user.provider;
        token.lastLogin = user.lastLogin;
        token.isFirstLogin = user.isFirstLogin;
        token.avatarUrl = user.avatarUrl;
        token.avatarPublicId = user.avatarPublicId;
        token.backendAccessToken = user.backendAccessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.provider = token.provider as "local" | "google";
        session.user.lastLogin = (token.lastLogin as string | null | undefined) ?? null;
        session.user.isFirstLogin = Boolean(token.isFirstLogin);
        session.user.avatarUrl = (token.avatarUrl as string | null | undefined) ?? null;
        session.user.avatarPublicId =
          (token.avatarPublicId as string | null | undefined) ?? null;
      }
      session.backendAccessToken = token.backendAccessToken as string;
      return session;
    },
  },
};
