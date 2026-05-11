export type UserProfileResponse = {
  id: string;
  name: string;
  email: string;
  provider: "local" | "google" | "discord";
  lastLogin: string | null;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  avatarPublicId: string | null;
};
