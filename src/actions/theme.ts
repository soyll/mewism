import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ipc } from "@/ipc/manager";
import { getSystemPrefersDark } from "@/utils/theme-options";
import type { ThemeMode } from "@/types/theme-mode";

export interface ThemePreferences {
  local: ThemeMode | null;
  system: ThemeMode;
}

export function resolveDocumentDarkMode(mode: ThemeMode): boolean {
  if (mode === "dark") {
    return true;
  }
  if (mode === "light") {
    return false;
  }
  return getSystemPrefersDark();
}

export function applyDocumentTheme(mode: ThemeMode) {
  const isDark = resolveDocumentDarkMode(mode);
  const resolved = isDark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = resolved;
  window.dispatchEvent(
    new CustomEvent<"light" | "dark">("mewism:theme", { detail: resolved })
  );
}

export async function getCurrentTheme(): Promise<ThemePreferences> {
  const currentTheme = await ipc.client.theme.getCurrentThemeMode();
  const localTheme = localStorage.getItem(
    LOCAL_STORAGE_KEYS.THEME
  ) as ThemeMode | null;

  return {
    system: currentTheme,
    local: localTheme,
  };
}

export async function setTheme(newTheme: ThemeMode) {
  applyDocumentTheme(newTheme);
  localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme);

  try {
    await ipc.client.theme.setThemeMode(newTheme);
  } catch (error) {
    console.error("Failed to sync theme with main process:", error);
  }
}

export async function syncWithLocalTheme() {
  const local = localStorage.getItem(
    LOCAL_STORAGE_KEYS.THEME
  ) as ThemeMode | null;
  await setTheme(local ?? "system");
}

export function subscribeToSystemThemeChange(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
