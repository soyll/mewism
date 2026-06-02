"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launcherActions } from "@/actions/mods";
import { notifyError, notifyWarning } from "@/lib/notify";

export function useGameLaunch() {
  const { t } = useTranslation();

  const launch = useCallback(async () => {
    try {
      const pre = await launcherActions.preflight();
      if (!pre.canLaunch) {
        notifyError(
          t("messages.missing_mods_title"),
          t("messages.missing_mods_text", {
            missing: pre.missingMods.join(", "),
          })
        );
        return;
      }
      if (pre.requirementErrors.length > 0) {
        const ok = window.confirm(
          `Requirement warnings:\n${pre.requirementErrors.join("\n")}\n\nLaunch anyway?`
        );
        if (!ok) {
          return;
        }
        const result = await launcherActions.launch({
          skipRequirementWarnings: true,
        });
        if (result.closeOnLaunch) {
          window.close();
        }
        return;
      }
      if (pre.protonWarning) {
        const ok = window.confirm(
          "Some mods are outside the game directory. Proton may not load them. Continue?"
        );
        if (!ok) {
          return;
        }
        const result = await launcherActions.launch({ skipProtonWarning: true });
        if (result.closeOnLaunch) {
          window.close();
        }
        return;
      }
      if (pre.dllWarning) {
        notifyWarning(t("messages.dll_injection_title"), pre.dllWarning);
      }
      const result = await launcherActions.launch({});
      if (result.closeOnLaunch) {
        window.close();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "PROTON_WARNING") {
        const ok = window.confirm(
          "External mod paths detected for Proton. Continue?"
        );
        if (ok) {
          await launcherActions.launch({ skipProtonWarning: true });
        }
      } else if (msg.startsWith("REQUIREMENTS:")) {
        const ok = window.confirm(`${msg.slice(13)}\n\nLaunch anyway?`);
        if (ok) {
          await launcherActions.launch({ skipRequirementWarnings: true });
        }
      } else {
        notifyError(
          t("messages.launch_error"),
          t("messages.launch_failed", { error: msg })
        );
      }
    }
  }, [t]);

  return { launch };
}
