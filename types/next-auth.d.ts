import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    backendAccessToken?: string;
    user: DefaultSession["user"] & {
      id: string;
      provider: "local" | "google" | "discord";
      lastLogin: string | null;
      isFirstLogin: boolean;
      avatarUrl?: string | null;
      avatarPublicId?: string | null;
    };
  }

  interface User {
    id: string;
    provider: "local" | "google" | "discord";
    lastLogin?: string | null;
    isFirstLogin?: boolean;
    avatarUrl?: string | null;
    avatarPublicId?: string | null;
    backendAccessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    provider?: "local" | "google" | "discord";
    lastLogin?: string | null;
    isFirstLogin?: boolean;
    avatarUrl?: string | null;
    avatarPublicId?: string | null;
    backendAccessToken?: string;
  }
}
