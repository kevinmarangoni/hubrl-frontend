import { withAuth } from "next-auth/middleware";

/**
 * Só avalia autenticação nestes padrões (lista estática — o Next exige isso no `matcher`).
 *
 * Públicas no middleware (por omissão): `/` (home), `/login`, `/hubrl/:hubrlId` (ver hubrl).
 * Protegidas aqui: área do utilizador, criar hubrl e editar hubrl.
 */
export default withAuth({
  callbacks: {
    authorized: ({ token }) => Boolean(token?.backendAccessToken?.trim()),
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/user/:path*", "/hubrl/create", "/create", "/hubrl/:hubrlId/edit"],
};
