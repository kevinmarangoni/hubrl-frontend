export const THEME_STORAGE_KEY = "hubrl-theme";

/** Script inline (beforeInteractive) para evitar flash de tema errado. */
export function getThemeInitScript(): string {
  const k = JSON.stringify(THEME_STORAGE_KEY);
  return `(function(){try{var k=${k};var t=localStorage.getItem(k);if(t==="dark")document.documentElement.classList.add("dark");else if(t==="light")document.documentElement.classList.remove("dark");else if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark");}catch(e){}})();`;
}
