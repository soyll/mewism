"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { modsActions, fsActions } from "@/actions/mods";
import { cn } from "@/utils/tailwind";
import type { ModDto } from "@/types/mods";

type ModCardProps = {
  mod: ModDto;
  onEnable?: (name: string) => void;
  onDisable?: (name: string) => void;
};

function ModPreviewImage({ mod }: { mod: ModDto }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!mod.preview_path) {
      setSrc(null);
      return;
    }
    modsActions.getPreviewDataUrl(mod.preview_path).then(setSrc);
  }, [mod.preview_path]);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">
        No Preview
      </div>
    );
  }

  return (
    <img
      alt={mod.title}
      className="aspect-video w-full rounded-md object-cover"
      src={src}
    />
  );
}

export function ModCard({ mod, onEnable, onDisable }: ModCardProps) {
  const { t } = useTranslation();
  const statusBorder = mod.missing
    ? "border-red-500/50"
    : mod.has_unmet_requirements
      ? "border-orange-500/50"
      : "border-border";

  return (
    <MorphingDialog>
      <MorphingDialogTrigger
        className={cn(
          "w-full overflow-hidden rounded-xl border bg-card p-3 text-left shadow-sm transition hover:shadow-md",
          statusBorder
        )}
      >
        <ModPreviewImage mod={mod} />
        <div className="mt-2 truncate font-medium text-sm">{mod.title}</div>
        <div className="truncate text-muted-foreground text-xs">
          {mod.author}
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl">
          <MorphingDialogClose />
          <MorphingDialogImage
            alt={mod.title}
            className="mb-4 aspect-video w-full rounded-lg object-cover"
            src=""
            style={{ display: "none" }}
          />
          <ModPreviewImage mod={mod} />
          <MorphingDialogTitle className="mt-4 font-bold text-xl">
            {mod.title}
          </MorphingDialogTitle>
          <MorphingDialogSubtitle className="text-muted-foreground text-sm">
            {mod.author} · v{mod.version}
          </MorphingDialogSubtitle>
          {mod.has_dlls && (
            <p className="mt-2 text-orange-400 text-sm">
              {t("preview.contains_dlls")}
            </p>
          )}
          <MorphingDialogDescription
            className="mt-3 whitespace-pre-wrap text-sm"
            disableLayoutAnimation
          >
            {mod.description || "—"}
          </MorphingDialogDescription>
          {mod.url && (
            <a
              className="mt-2 inline-block text-primary text-sm underline"
              href={mod.url}
              onClick={(e) => {
                e.preventDefault();
                fsActions.openExternal(mod.url);
              }}
            >
              {mod.url}
            </a>
          )}
          <div className="mt-4 flex gap-2">
            {mod.enabled ? (
              <Button
                onClick={() => onDisable?.(mod.name)}
                size="sm"
                variant="outline"
              >
                {t("context_menu.disable")}
              </Button>
            ) : (
              <Button onClick={() => onEnable?.(mod.name)} size="sm">
                {t("context_menu.enable")}
              </Button>
            )}
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

type ModGridProps = {
  mods: ModDto[];
  onEnable?: (name: string) => void;
  onDisable?: (name: string) => void;
};

export function ModGrid({ mods, onEnable, onDisable }: ModGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {mods.map((mod) => (
        <ModCard
          key={mod.name}
          mod={mod}
          onDisable={onDisable}
          onEnable={onEnable}
        />
      ))}
    </div>
  );
}
