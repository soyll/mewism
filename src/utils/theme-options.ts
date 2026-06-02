import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import type { ThemeMode } from "@/types/theme-mode";

export interface ThemeOption {
  value: ThemeMode;
  icon: LucideIcon;
  labelKey: "menu.theme_light" | "menu.theme_dark" | "menu.theme_system";
}

const SYSTEM_OPTION: ThemeOption = {
  value: "system",
  icon: Monitor,
  labelKey: "menu.theme_system",
};

const LIGHT_OPTION: ThemeOption = {
  value: "light",
  icon: Sun,
  labelKey: "menu.theme_light",
};

const DARK_OPTION: ThemeOption = {
  value: "dark",
  icon: Moon,
  labelKey: "menu.theme_dark",
};

/** System first; contrast option second, matching-system option third. */
export function getOrderedThemeOptions(
  systemPrefersDark: boolean
): ThemeOption[] {
  if (systemPrefersDark) {
    return [SYSTEM_OPTION, LIGHT_OPTION, DARK_OPTION];
  }
  return [SYSTEM_OPTION, DARK_OPTION, LIGHT_OPTION];
}

export function getSystemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function themeLabelKey(
  theme: ThemeMode
): "menu.theme_light" | "menu.theme_dark" | "menu.theme_system" {
  if (theme === "light") {
    return "menu.theme_light";
  }
  if (theme === "dark") {
    return "menu.theme_dark";
  }
  return "menu.theme_system";
}
