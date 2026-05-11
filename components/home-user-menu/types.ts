export type HomeUserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
  /** Estilo do botão sobre fundos escuros (hero full-bleed). */
  overlayTrigger?: boolean;
};
