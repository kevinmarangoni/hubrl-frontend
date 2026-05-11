export function mapAuthError(code: string | null): string | null {
  if (!code) {
    return null;
  }
  if (code === "AccessDenied") {
    return "Não foi possível concluir o login. Verifique se o provedor liberou email e nome no perfil.";
  }
  if (code === "Configuration") {
    return "Configuração de autenticação incompleta. Confira as variáveis de ambiente.";
  }
  return "Falha no login. Tente novamente.";
}
