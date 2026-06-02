"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { configActions, fsActions } from "@/actions/mods";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import { GamePathField } from "@/components/shared/game-path-field";
import { MorphText } from "@/components/ui/morph-text";
import { notifyError } from "@/lib/notify";
import type { ConfigDto } from "@/types/mods";

type SaveStatus = "idle" | "saving" | "saved";

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const { t } = useTranslation();

  if (status === "idle") {
    return null;
  }

  const label =
    status === "saving" ? t("settings.saving") : t("settings.saved");

  return (
    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
      {status === "saving" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <CheckCircle2 className="h-3 w-3 text-green-600" />
      )}
      <MorphText>{label}</MorphText>
    </span>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    configActions.load().then((loaded) => {
      if (!loaded.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setConfig(loaded);
    });
  }, [navigate]);

  const persistConfig = useCallback(async (next: ConfigDto) => {
    setConfig(next);
    setSaveStatus("saving");
    if (savedFadeRef.current) {
      clearTimeout(savedFadeRef.current);
    }
    try {
      await configActions.save(next);
      setSaveStatus("saved");
      savedFadeRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("idle");
      notifyError(t("messages.error"), t("messages.config_save_error"));
    }
  }, [t]);

  const patchConfig = useCallback(
    (patch: Partial<ConfigDto>) => {
      if (!config) {
        return;
      }
      persistConfig({ ...config, ...patch }).catch(() => {
        notifyError(t("messages.error"), t("messages.config_save_error"));
      });
    },
    [config, persistConfig, t]
  );

  const patchConfigDebounced = useCallback(
    (patch: Partial<ConfigDto>, delayMs = 400) => {
      if (!config) {
        return;
      }
      const next = { ...config, ...patch };
      setConfig(next);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      setSaveStatus("saving");
      saveTimerRef.current = setTimeout(() => {
        persistConfig(next).catch(() => {
          notifyError(t("messages.error"), t("messages.config_save_error"));
        });
      }, delayMs);
    },
    [config, persistConfig, t]
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (savedFadeRef.current) {
        clearTimeout(savedFadeRef.current);
      }
    },
    []
  );

  const pickModFolder = async () => {
    const path = await fsActions.pickFolder(t("settings.mods_folder"));
    if (path) {
      patchConfig({ mod_folder: path });
    }
  };

  if (!config) {
    return (
      <div className="p-4">
        <MorphText>{t("window.checking")}</MorphText>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4">
      {saveStatus !== "idle" && (
        <div className="flex justify-end">
          <SaveStatusIndicator status={saveStatus} />
        </div>
      )}

      <div className="space-y-1">
        <span className="text-sm">{t("settings.game_install_dir")}</span>
        <GamePathField
          onChange={(path) => patchConfig({ game_install_dir: path })}
          value={config.game_install_dir}
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm">{t("settings.mods_folder")}</span>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 cursor-default rounded-md border bg-muted/50 px-3 py-2 text-muted-foreground text-sm"
            readOnly
            tabIndex={-1}
            value={config.mod_folder}
          />
          <Button onClick={pickModFolder} type="button" variant="outline">
            {t("settings.browse")}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm" htmlFor="custom-launch-options">
          {t("settings.custom_launch_options")}
        </label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          id="custom-launch-options"
          onChange={(e) =>
            patchConfigDebounced({ custom_launch_options: e.target.value })
          }
          value={config.custom_launch_options}
        />
      </div>

      <div className="space-y-2">
        {(
          [
            ["dev_mode_enabled", t("settings.dev_mode")],
            ["debug_console_enabled", t("settings.debug_console")],
            ["close_on_launch", t("settings.close_on_launch")],
            ["dll_injection_enabled", t("settings.dll_injection")],
          ] as const
        ).map(([key, label]) => (
          <div className="flex items-center gap-2" key={key}>
            <Checkbox
              checked={config[key]}
              id={`settings-${key}`}
              onCheckedChange={(checked) =>
                patchConfig({ [key]: checked === true })
              }
            />
            <label
              className="cursor-pointer text-sm"
              htmlFor={`settings-${key}`}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
