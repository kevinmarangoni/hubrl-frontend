import type { Account, NextAuthOptions, Profile, User } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import { backendUrl, http } from "@/lib/http";

type BackendAuthResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    provider: "local" | "google" | "discord";
    lastLogin: string | null;
    isFirstLogin: boolean;
    avatarUrl: string | null;
    avatarPublicId: string | null;
  };
};

function applyBackendUser(adapterUser: User, data: BackendAuthResponse) {
  adapterUser.id = data.user.id;
  adapterUser.email = data.user.email;
  adapterUser.name = data.user.name;
  adapterUser.provider = data.user.provider;
  adapterUser.lastLogin = data.user.lastLogin;
  adapterUser.isFirstLogin = data.user.isFirstLogin;
  adapterUser.avatarUrl = data.user.avatarUrl;
  adapterUser.avatarPublicId = data.user.avatarPublicId;
  adapterUser.backendAccessToken = data.accessToken;
}

async function syncOAuthWithBackend(params: {
  adapterUser: User;
  account: Account;
  profile: Profile | undefined;
  provider: "google" | "discord";
}): Promise<boolean> {
  const { adapterUser, account, profile, provider } = params;
  const emailRaw = adapterUser.email ?? (profile as { email?: string } | undefined)?.email;
  const email = typeof emailRaw === "string" ? emailRaw.trim() : "";
  const discordProfile = profile as { global_name?: string | null; username?: string } | undefined;
  const nameRaw =
    adapterUser.name ??
    profile?.name ??
    discordProfile?.global_name ??
    discordProfile?.username ??
    (provider === "discord" ? "Discord" : "");
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  const subject = account.providerAccountId?.trim() ?? "oauth";
  const token = `${provider}_${subject}`;

  if (!email || !name) {
    return false;
  }

  const path = provider === "google" ? "login/google" : "login/discord";
  const body =
    provider === "google"
      ? { googleToken: token, email, name }
      : { discordToken: token, email, name };

  const response = await http.post(backendUrl(`users/${path}`), { json: body });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as BackendAuthResponse;
  applyBackendUser(adapterUser, data);
  return true;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!account?.provider) {
        return false;
      }
      if (account.provider === "google") {
        return syncOAuthWithBackend({ adapterUser: user, account, profile, provider: "google" });
      }
      if (account.provider === "discord") {
        return syncOAuthWithBackend({ adapterUser: user, account, profile, provider: "discord" });
      }
      return false;
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
        session.user.provider = token.provider as "local" | "google" | "discord";
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
