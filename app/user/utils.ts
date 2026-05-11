export function providerBadge(provider: "local" | "google" | "discord"): string {
  if (provider === "google") {
    return "Conta Google";
  }
  if (provider === "discord") {
    return "Conta Discord";
  }
  return "Email e senha";
}

export function firstName(name: string): string {
  const part = name.trim().split(/\s+/)[0];
  return part || name;
}
