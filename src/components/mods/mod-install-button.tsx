"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { fsActions, modsActions } from "@/actions/mods";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { notifyError } from "@/lib/notify";

export function ModInstallButton({
  onInstalled,
}: {
  onInstalled: () => void;
}) {
  const { t } = useTranslation();
  const [installing, setInstalling] = useState(false);

  const installZip = useCallback(
    async (sourcePath: string, replace = false) => {
      setInstalling(true);
      try {
        await modsActions.install(sourcePath, "zip", replace);
        onInstalled();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("CONFLICT:")) {
          const modName = msg.slice("CONFLICT:".length);
          const ok = window.confirm(
            `Mod "${modName}" already exists. Replace?`
          );
          if (ok) {
            await installZip(sourcePath, true);
          }
          return;
        }
        notifyError(t("messages.error"), msg);
      } finally {
        setInstalling(false);
      }
    },
    [onInstalled, t]
  );

  const pickZip = async () => {
    const path = await fsActions.pickFile({
      title: t("ui.install_mod"),
      filters: [{ name: "Mod Archive", extensions: ["zip"] }],
    });
    if (path) {
      await installZip(path);
    }
  };

  return (
    <Button
      disabled={installing}
      onClick={pickZip}
      size="icon-sm"
      title={t("ui.install_mod")}
      variant="outline"
    >
      <Upload className="h-4 w-4" />
      <span className="sr-only">{t("ui.install_mod")}</span>
    </Button>
  );
}
