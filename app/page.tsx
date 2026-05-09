import { HomeHeader } from "./home-header";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-10 md:px-6">
      <HomeHeader />
      <section className="glass-panel p-8 md:p-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-accent">Bem-vindo</p>
        <h1 className="m-0 text-3xl font-bold tracking-tight md:text-4xl">
          <span className="bg-gradient-to-r from-accent via-accent-hover to-accent bg-clip-text text-transparent">
            hubrl
          </span>{" "}
          <span className="text-fg">home</span>
        </h1>
        <p className="mt-4 max-w-xl text-fg-muted">
          Monte seu hubrl com links, tema e identidade visual. Use o menu acima para entrar ou gerenciar sua conta.
        </p>
      </section>
    </main>
  );
}
