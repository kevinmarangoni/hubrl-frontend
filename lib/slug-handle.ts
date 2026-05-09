/** Sugestão inicial de @handle a partir do nome (só para valor inicial do form; não fica ligado ao título). */
export function suggestedHandleFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 32);
}
