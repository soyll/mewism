"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { modsActions } from "@/actions/mods";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { MorphText } from "@/components/ui/morph-text";
import { notifyError } from "@/lib/notify";
import { cn } from "@/utils/tailwind";

type ModInstallDropZoneProps = {
  onInstalled: () => void;
  className?: string;
  showButton?: boolean;
  children?: React.ReactNode;
};

export function ModInstallDropZone({
  onInstalled,
  className,
  showButton = true,
  children,
}: ModInstallDropZoneProps) {
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstallPaths = useCallback(
    async (paths: string[], replace = false) => {
      if (paths.length === 0) {
        return;
      }
      setInstalling(true);
      try {
        const result = await modsActions.installFromDrop(paths, replace);
        if (result.conflicts.length > 0) {
          const ok = window.confirm(
            `Mod "${result.conflicts[0].modName}" already exists. Replace?`
          );
          if (ok) {
            await modsActions.installFromDrop(
              result.conflicts.map((c) => c.sourcePath),
              true
            );
          }
        }
        onInstalled();
      } catch (e) {
        notifyError(
          t("messages.error"),
          e instanceof Error ? e.message : String(e)
        );
      } finally {
        setInstalling(false);
        setDragOver(false);
      }
    },
    [onInstalled]
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const paths: string[] = [];
      for (const file of Array.from(e.dataTransfer.files)) {
        const electronPath = (
          file as File & { path?: string }
        ).path;
        if (electronPath) {
          paths.push(electronPath);
        }
      }
      await handleInstallPaths(paths);
    },
    [handleInstallPaths]
  );

  const pickInstall = async () => {
    const { fsActions } = await import("@/actions/mods");
    const paths = await fsActions.pickInstallMod();
    await handleInstallPaths(paths);
  };

  return (
    <div
      className={cn("relative", className)}
      onDragLeave={() => setDragOver(false)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDrop={onDrop}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-primary border-dashed bg-primary/10">
          <MorphText className="font-medium text-primary">
            {t("ui.drop_mod_hint")}
          </MorphText>
        </div>
      )}
      {showButton && (
        <Button
          disabled={installing}
          onClick={pickInstall}
          size="sm"
          variant="outline"
        >
          <Upload />
          <MorphText>
            {installing ? t("window.checking") : t("ui.install_mod")}
          </MorphText>
        </Button>
      )}
      {children}
    </div>
  );
}
