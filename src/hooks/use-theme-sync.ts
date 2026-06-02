import { useEffect, useState } from "react";
import { LOCAL_STORAGE_KEYS } from "@/constants";
import {
  applyDocumentTheme,
  setTheme,
  subscribeToSystemThemeChange,
} from "@/actions/theme";
import type { ThemeMode } from "@/types/theme-mode";

function isOnboardingRoute() {
  return window.location.pathname.includes("onboarding");
}

function readDocumentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useThemeSync(): "light" | "dark" {
  const [resolvedTheme, setResolvedTheme] = useState(readDocumentTheme);

  useEffect(() => {
    if (isOnboardingRoute()) {
      setTheme("system").catch(() => undefined);
    } else {
      const stored = localStorage.getItem(
        LOCAL_STORAGE_KEYS.THEME
      ) as ThemeMode | null;
      setTheme(stored ?? "system").catch(() => undefined);
    }

    const onTheme = (event: Event) => {
      setResolvedTheme((event as CustomEvent<"light" | "dark">).detail);
    };

    window.addEventListener("mewism:theme", onTheme);

    const unsubscribeSystem = subscribeToSystemThemeChange(() => {
      const current = localStorage.getItem(
        LOCAL_STORAGE_KEYS.THEME
      ) as ThemeMode | null;
      if (!current || current === "system") {
        applyDocumentTheme("system");
      }
    });

    return () => {
      window.removeEventListener("mewism:theme", onTheme);
      unsubscribeSystem();
    };
  }, []);

  return resolvedTheme;
}
