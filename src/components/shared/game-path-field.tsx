"use client";

import { FolderOpen, Loader2, Radar } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { configActions, fsActions } from "@/actions/mods";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { MorphText } from "@/components/ui/morph-text";
import { notifyError } from "@/lib/notify";
import { cn } from "@/utils/tailwind";

interface GamePathFieldProps {
  className?: string;
  onChange: (path: string) => void;
  onValidityChange?: (valid: boolean) => void;
  value: string;
}

export function GamePathField({
  value,
  onChange,
  onValidityChange,
  className,
}: GamePathFieldProps) {
  const { t } = useTranslation();
  const [displayPath, setDisplayPath] = useState(value);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setDisplayPath(value);
  }, [value]);

  const applyPath = async (path: string) => {
    setChecking(true);
    setDisplayPath(path);
    try {
      const result = await configActions.validateGamePath(path);
      if (result.valid) {
        onChange(path);
        onValidityChange?.(true);
        return true;
      }
      notifyError(t("messages.game_dir_invalid"), t("messages.exe_not_found"));
      onValidityChange?.(false);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const pickFolder = async () => {
    const path = await fsActions.pickFolder(t("settings.game_install_dir"));
    if (path) {
      await applyPath(path);
    }
  };

  const autoDetect = async () => {
    setChecking(true);
    try {
      const path = await configActions.detectGamePath();
      if (!path) {
        notifyError(
          t("messages.game_dir_invalid"),
          t("messages.game_dir_not_detected")
        );
        onValidityChange?.(false);
        return;
      }
      await applyPath(path);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div
          className={cn(
            "flex min-h-10 min-w-0 flex-1 items-center truncate rounded-md border bg-muted/50 px-3 py-2 text-muted-foreground text-sm",
            !displayPath && "text-muted-foreground/60"
          )}
        >
          <MorphText className="truncate">
            {displayPath || t("onboarding.game_path_placeholder")}
          </MorphText>
        </div>
        <Button
          disabled={checking}
          onClick={pickFolder}
          type="button"
          variant="outline"
          size="lg"
        >
          {checking ? <Loader2 className="animate-spin" /> : <FolderOpen />}
          {t("onboarding.select_folder")}
        </Button>
        <Button
          disabled={checking}
          onClick={autoDetect}
          type="button"
          variant="outline"
          size={"lg"}
        >
          {checking ? <Loader2 className="animate-spin" /> : <Radar />}
          {t("settings.auto_detect")}
        </Button>
      </div>
    </div>
  );
}
