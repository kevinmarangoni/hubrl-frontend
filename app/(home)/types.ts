import type { LucideIcon } from "lucide-react";
import { Globe, Layers, LayoutGrid, Link2, LogIn, Sparkles } from "lucide-react";

export type HomeQuickLink = {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly icon: LucideIcon;
};

export type HomeHighlight = {
  readonly title: string;
  readonly text: string;
  readonly icon: LucideIcon;
};

export const homeQuickLinks: readonly HomeQuickLink[] = [
  {
    href: "/hubrl/create",
    title: "Criar hubrl",
    description: "Monte a página no estilo preview: identidade, links e aparência.",
    icon: Sparkles,
  },
  {
    href: "/user",
    title: "Painel",
    description: "Acesse o painel para ver, editar ou criar hubrls na sua conta.",
    icon: LayoutGrid,
  },
  {
    href: "/login",
    title: "Entrar",
    description: "Inicie sessão para guardar hubrls e sincronizar o perfil.",
    icon: LogIn,
  },
];

export const homeHighlights: readonly HomeHighlight[] = [
  {
    title: "Links à medida",
    text: "Texto, URL e destaque visual alinhados ao seu tema.",
    icon: Link2,
  },
  {
    title: "Fundo em camadas",
    text: "Imagem, gradiente e cor sólida com opacidade independente.",
    icon: Layers,
  },
  {
    title: "Um link público",
    text: "Partilhe o endereço do hubrl; a edição fica na área autenticada.",
    icon: Globe,
  },
];
