"use client";

import { ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  configActions,
  dllActions,
  fsActions,
  modlistActions,
  packActions,
} from "@/actions/mods";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { useMods, useModsMutations } from "@/hooks/use-mods";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/notify";

export function ModManagerActionsMenu() {
  const { t } = useTranslation();
  const { refetch } = useMods();
  const mutations = useModsMutations();

  const handleAutoSort = async () => {
    const result = await mutations.autoSort();
    if (result.warnings.length > 0) {
      notifyWarning(
        t("messages.conflict_warnings_title"),
        result.warnings.join("\n")
      );
    }
    await mutations.invalidate();
  };

  const openModsFolder = async () => {
    const config = await configActions.load();
    await fsActions.openFolder(config.mod_folder);
  };

  const importModlist = async () => {
    const path = await fsActions.pickFile({
      filters: [{ name: "Modlist", extensions: ["json", "txt"] }],
    });
    if (!path) {
      return;
    }
    if (path.endsWith(".json")) {
      await modlistActions.importJson(path);
    } else {
      await modlistActions.importText(path);
    }
    await refetch();
  };

  const exportModlist = async () => {
    const path = await fsActions.pickSaveFile({
      filters: [{ name: "Modlist", extensions: ["json"] }],
    });
    if (path) {
      await modlistActions.exportJson(path);
    }
  };

  const unpackBaseResources = async () => {
    try {
      await packActions.unpack();
      notifySuccess(t("messages.unpack_complete"));
    } catch (e) {
      notifyError(
        t("messages.error"),
        e instanceof Error ? e.message : String(e)
      );
    }
  };

  const cleanupDllInjection = async () => {
    if (window.confirm(t("messages.dll_cleanup_confirm"))) {
      await dllActions.cleanup();
      notifySuccess(t("messages.dll_cleanup_success"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          {t("ui.actions_menu")}
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("ui.mods")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => mutations.enableAll()}>
              {t("ui.enable_all")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => mutations.disableAll()}>
              {t("ui.disable_all")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleAutoSort}>
              {t("mod_list.auto_sort")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("ui.group_modlists")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={openModsFolder}>
              {t("menu.file.open_mods")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={importModlist}>
              {t("menu.file.import_modlist")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={exportModlist}>
              {t("menu.file.export_modlist")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("ui.group_tools")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={unpackBaseResources}>
              {t("menu.file.unpack")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={cleanupDllInjection}
              variant="destructive"
            >
              {t("menu.file.cleanup_dlls")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
