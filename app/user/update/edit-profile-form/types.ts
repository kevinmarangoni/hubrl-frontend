export type UpdateProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    provider: "local" | "google" | "discord";
    lastLogin: string | null;
    isFirstLogin: boolean;
  };
};

export type EditProfileFormProps = {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl: string | null;
  userId: string;
};
