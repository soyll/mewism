"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { configActions, modsActions } from "@/actions/mods";
import { useAppShell } from "@/components/layout/app-shell-context";
import { ModGrid } from "@/components/mods/mod-grid";
import { ModManagerActionsMenu } from "@/components/mods/mod-manager-actions-menu";
import { ModInstallDropZone } from "@/components/mods/mod-install-drop-zone";
import {
  ModViewToggle,
  getStoredViewMode,
} from "@/components/mods/mod-view-toggle";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { MorphText } from "@/components/ui/morph-text";
import {
  DraggableList,
  type ModListItem,
} from "@/components/ui/draggable-list";
import { MODS_QUERY_KEY, useMods, useModsMutations } from "@/hooks/use-mods";
import type { ModDto, ModViewMode } from "@/types/mods";
import { router } from "@/utils/routes";

function filterMods(mods: ModDto[], query: string): ModDto[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return mods;
  }
  return mods.filter(
    (mod) =>
      mod.title.toLowerCase().includes(trimmed) ||
      mod.author.toLowerCase().includes(trimmed) ||
      mod.name.toLowerCase().includes(trimmed) ||
      mod.description.toLowerCase().includes(trimmed)
  );
}

function StaticModList({
  mods,
  onSelect,
  selectedId,
  onDoubleClick,
}: {
  mods: ModDto[];
  selectedId?: string | null;
  onSelect?: (mod: ModDto) => void;
  onDoubleClick?: (mod: ModDto) => void;
}) {
  return (
    <div className="space-y-2">
      {mods.map((mod) => (
        <button
          className={`w-full rounded-lg border p-3 text-left text-sm ${
            mod.missing
              ? "border-red-500/60 text-red-400"
              : mod.has_unmet_requirements
                ? "border-orange-500/60"
                : ""
          } ${selectedId === mod.name ? "ring-2 ring-primary/50" : ""}`}
          key={mod.name}
          onClick={() => onSelect?.(mod)}
          onDoubleClick={() => onDoubleClick?.(mod)}
          type="button"
        >
          <div className="font-medium">{mod.title}</div>
          <div className="text-muted-foreground text-xs">
            {mod.author} · v{mod.version}
          </div>
        </button>
      ))}
    </div>
  );
}

export function ModManagerPage() {
  const { t } = useTranslation();
  const { searchQuery } = useAppShell();
  const { data, isLoading, refetch } = useMods();
  const mutations = useModsMutations();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ModViewMode>("list");
  const [selectedMod, setSelectedMod] = useState<ModDto | null>(null);
  const [tab, setTab] = useState<"enabled" | "disabled" | "all">("enabled");

  useEffect(() => {
    setViewMode(getStoredViewMode());
  }, []);

  useEffect(() => {
    configActions.load().then((config) => {
      if (!config.onboarding_completed) {
        router.navigate({ to: "/onboarding" });
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await modsActions.checkChanges();
      if (result.changed && result.mods) {
        queryClient.setQueryData(MODS_QUERY_KEY, result.mods);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const enabled = useMemo(
    () => filterMods(data?.enabled ?? [], searchQuery),
    [data?.enabled, searchQuery]
  );
  const disabled = useMemo(
    () => filterMods(data?.disabled ?? [], searchQuery),
    [data?.disabled, searchQuery]
  );

  const enabledItems: ModListItem[] = enabled.map((m) => ({
    id: m.name,
    mod: m,
  }));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <MorphText>{t("window.checking")}</MorphText>
      </div>
    );
  }

  const tabLabels: Record<typeof tab, string> = {
    enabled: t("ui.enabled_mods"),
    disabled: t("ui.disabled_mods"),
    all: t("ui.all_mods"),
  };

  const gridMods =
    tab === "enabled"
      ? enabled
      : tab === "disabled"
        ? disabled
        : [...enabled, ...disabled];

  return (
    <ModInstallDropZone
      className="flex h-full min-h-0 flex-col gap-4 p-4"
      onInstalled={() => refetch()}
      showButton={false}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ModViewToggle onChange={setViewMode} value={viewMode} />
        <ModManagerActionsMenu />
      </div>

      {viewMode === "list" ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <section>
            <h2 className="mb-2 font-medium text-sm">
              {t("ui.disabled_mods")}
            </h2>
            <StaticModList
              mods={disabled}
              onDoubleClick={(m) => mutations.enable(m.name)}
              selectedId={selectedMod?.name}
              onSelect={setSelectedMod}
            />
          </section>
          <section>
            <h2 className="mb-2 font-medium text-sm">{t("ui.enabled_mods")}</h2>
            <DraggableList
              items={enabledItems}
              onReorder={(items) =>
                mutations.reorder(items.map((i) => i.id))
              }
              onSelect={setSelectedMod}
              selectedId={selectedMod?.name ?? null}
            />
          </section>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mb-3 flex gap-2">
            {(["enabled", "disabled", "all"] as const).map((k) => (
              <Button
                key={k}
                onClick={() => setTab(k)}
                size="sm"
                variant={tab === k ? "default" : "outline"}
              >
                <MorphText>{tabLabels[k]}</MorphText>
              </Button>
            ))}
          </div>
          <ModGrid
            mods={gridMods}
            onDisable={(n) => mutations.disable(n)}
            onEnable={(n) => mutations.enable(n)}
          />
        </div>
      )}

      {selectedMod && viewMode === "list" && (
        <aside className="rounded-lg border p-4">
          <MorphText as="h3" className="font-semibold">
            {selectedMod.title}
          </MorphText>
          <MorphText as="p" className="text-muted-foreground text-sm">
            {`${selectedMod.author} · v${selectedMod.version}`}
          </MorphText>
          <MorphText
            as="p"
            className="mt-2 whitespace-pre-wrap text-sm"
          >
            {selectedMod.description}
          </MorphText>
        </aside>
      )}
    </ModInstallDropZone>
  );
}
