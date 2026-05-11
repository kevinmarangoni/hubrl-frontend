import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { HomeHeader } from "@/components/home-header";
import { HubrlLogo } from "@/components/hubrl-logo";
import { homeHighlights, homeQuickLinks } from "./types";

export const metadata: Metadata = {
  title: "hubrl — página de links com a sua cara",
  description:
    "Crie um hubrl com foto, bio, links e fundo em camadas (imagem, gradiente, cor). Edite em preview e partilhe um único link público.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <section className="home-hero relative w-full overflow-hidden">
        <HomeHeader variant="overlay" />

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-24 pt-28 text-center md:max-w-6xl md:px-8 md:pb-28 md:pt-32 lg:max-w-7xl">
          <HubrlLogo className="mb-6 size-20 text-white/95 drop-shadow-lg md:mb-8 md:size-28" aria-hidden />
          <h1 className="m-0 max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-md md:text-6xl md:leading-[1.06] lg:text-7xl">
            <span className="bg-gradient-to-r from-violet-100 via-white to-fuchsia-100 bg-clip-text text-transparent">
              hubrl
            </span>{" "}
            <span className="text-white">reúne tudo num só lugar.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/88 drop-shadow-sm md:mt-8 md:text-lg md:leading-relaxed">
            Personalize foto, bio e lista de links, escolha o fundo da página e do cartão, e publique quando estiver
            pronto. Ideal para perfis, portfólios rápidos ou listas de recursos.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:mt-12">
            <Link
              href="/hubrl/create"
              className="inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-8 text-base font-semibold text-violet-950 shadow-xl no-underline transition hover:bg-violet-50 md:py-3 md:pl-3 md:pr-10"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-inner md:h-12 md:w-12">
                <ArrowRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
              </span>
              Criar hubrl
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/55 bg-white/5 px-8 py-3.5 text-base font-semibold text-white no-underline shadow-sm backdrop-blur-sm transition hover:border-white/80 hover:bg-white/15 md:px-10 md:py-4"
            >
              Entrar
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16 lg:px-12 lg:py-20">
          <section aria-labelledby="home-highlights-heading">
            <h2 id="home-highlights-heading" className="sr-only">
              Destaques
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {homeHighlights.map(({ title, text, icon: Icon }) => (
                <li
                  key={title}
                  className="glass-panel flex flex-col gap-2 p-5 text-left shadow-none md:p-6"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-muted text-accent">
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                  <p className="m-0 text-sm font-semibold text-fg">{title}</p>
                  <p className="m-0 text-sm leading-relaxed text-fg-muted">{text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 md:mt-16" aria-labelledby="home-actions-heading">
            <h2 id="home-actions-heading" className="mb-5 text-lg font-semibold text-fg md:mb-6 md:text-xl">
              Começar
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {homeQuickLinks.map(({ href, title, description, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="glass-panel group flex h-full flex-col gap-3 p-6 no-underline transition hover:border-[color-mix(in_srgb,var(--color-accent)_38%,var(--color-border))] hover:shadow-glow md:p-7"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted text-accent transition group-hover:bg-[color-mix(in_srgb,var(--color-accent-muted)_65%,transparent)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-base font-semibold text-fg">{title}</span>
                      <ChevronRight
                        className="mt-0.5 h-5 w-5 shrink-0 text-fg-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden
                      />
                    </span>
                    <p className="m-0 text-sm leading-relaxed text-fg-muted">{description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
