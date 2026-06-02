import { configActions } from "@/actions/mods";
import { applyDocumentTheme, syncWithLocalTheme } from "@/actions/theme";
import { router } from "@/utils/routes";

export async function runAppStartup(): Promise<void> {
  const config = await configActions.load();

  if (!config.onboarding_completed) {
    applyDocumentTheme("system");
    await router.navigate({ to: "/onboarding" });
    return;
  }

  await syncWithLocalTheme();
}

export function revealApp(): void {
  requestAnimationFrame(() => {
    document.body.style.removeProperty("opacity");
    document.body.classList.add("app-ready");
  });
}
