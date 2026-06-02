import { readFileSync } from "node:fs";
import { os } from "@orpc/server";
import { z } from "zod";
import { getServices } from "@/main/bootstrap";
import type { Mod } from "@/main/models/mod";
import type { DllInjectionService } from "@/main/services/dll-injection-service";
import { getPathType } from "@/main/services/mod-install-service";
import type { ModDto } from "@/types/mods";

function modToDto(mod: Mod, dllService: DllInjectionService): ModDto {
  return {
    ...mod.toDict(),
    has_dlls: dllService.modHasDlls(mod),
    title: mod.title,
    author: mod.author,
    version: mod.version,
    description: mod.description,
    url: mod.url,
  };
}

function buildModListDto() {
  const svc = getServices();
  const modList = svc.getModList();
  const errors = svc.modService!.validateRequirements(modList);
  const dll = svc.dllInjectionService;
  const config = svc.getConfig();

  const mapMod = (m: Mod) => {
    const dto = modToDto(m, dll);
    if (dto.has_dlls && !config.dll_injection_enabled) {
      dto.has_unmet_requirements = true;
    }
    return dto;
  };

  return {
    enabled: modList.enabledMods.map(mapMod),
    disabled: modList.disabledMods.map(mapMod),
    errors,
  };
}

export const list = os.handler(() => buildModListDto());

export const checkChanges = os.handler(() => {
  const changed = getServices().checkExternalChanges();
  return { changed, mods: changed ? buildModListDto() : null };
});

export const enable = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.enableMod(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const disable = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.disableMod(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const enableAll = os.handler(() => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.enableAll();
  svc.persistModList(modList);
  return buildModListDto();
});

export const disableAll = os.handler(() => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.disableAll();
  svc.persistModList(modList);
  return buildModListDto();
});

export const reorder = os
  .input(z.object({ enabledNames: z.array(z.string()) }))
  .handler(({ input }) => {
    const svc = getServices();
    const modList = svc.getModList();
    modList.setOrder(input.enabledNames);
    svc.persistModList(modList);
    return buildModListDto();
  });

export const moveUp = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.moveUp(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const moveDown = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.moveDown(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const moveToTop = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.moveToTop(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const moveToBottom = os.input(z.object({ name: z.string() })).handler(({ input }) => {
  const svc = getServices();
  const modList = svc.getModList();
  modList.moveToBottom(input.name);
  svc.persistModList(modList);
  return buildModListDto();
});

export const autoSort = os.handler(() => {
  const svc = getServices();
  const modList = svc.getModList();
  const { sortedNames, warnings } = svc.modService!.autoSort(modList);
  modList.setOrder(sortedNames);
  svc.persistModList(modList);
  return { ...buildModListDto(), warnings };
});

export const getPreviewDataUrl = os
  .input(z.object({ previewPath: z.string().nullable() }))
  .handler(({ input }) => {
    if (!input.previewPath) {
      return null;
    }
    try {
      const buf = readFileSync(input.previewPath);
      const ext = input.previewPath.split(".").pop()?.toLowerCase() ?? "png";
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : "image/png";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  });

export const install = os
  .input(
    z.object({
      sourcePath: z.string(),
      type: z.enum(["zip", "folder"]),
      replace: z.boolean().optional(),
    })
  )
  .handler(async ({ input }) => {
    const svc = getServices();
    const result = await svc.modInstallService!.install(
      input.sourcePath,
      input.type,
      input.replace ?? false
    );
    return { ...result, mods: buildModListDto() };
  });

export const installFromDrop = os
  .input(
    z.object({
      paths: z.array(z.string()),
      replace: z.boolean().optional(),
    })
  )
  .handler(async ({ input }) => {
    const svc = getServices();
    const results = [];
    const conflicts: { modName: string; sourcePath: string; type: "zip" | "folder" }[] = [];

    for (const sourcePath of input.paths) {
      try {
        const type = await getPathType(sourcePath);
        const conflict = svc.modInstallService!.checkConflict(sourcePath, type);
        if (conflict && !input.replace) {
          conflicts.push(conflict);
          continue;
        }
        const result = await svc.modInstallService!.install(
          sourcePath,
          type,
          input.replace ?? false
        );
        results.push(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.startsWith("CONFLICT:")) {
          conflicts.push({
            modName: msg.slice(9),
            sourcePath,
            type: sourcePath.toLowerCase().endsWith(".zip") ? "zip" : "folder",
          });
        } else {
          throw e;
        }
      }
    }

    return {
      results,
      conflicts,
      mods: buildModListDto(),
    };
  });
