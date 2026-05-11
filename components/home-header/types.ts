export type HomeHeaderUserProfile = {
  id: string;
  name: string;
  email: string;
  provider: "local" | "google" | "discord";
  lastLogin: string | null;
  isFirstLogin: boolean;
  avatarUrl: string | null;
  avatarPublicId: string | null;
};

export type HomeHeaderProps = {
  /** Sobrepõe o hero full-bleed (estilo referência com nav transparente). */
  variant?: "default" | "overlay";
  /** Classes extra no `<header>` (ex.: `mb-6` nas páginas internas). */
  className?: string;
};
