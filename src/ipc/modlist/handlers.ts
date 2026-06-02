import { os } from "@orpc/server";
import { z } from "zod";
import { getServices } from "@/main/bootstrap";

export const importJson = os
  .input(z.object({ filepath: z.string() }))
  .handler(({ input }) => {
    const svc = getServices();
    const names = svc.modListIOService.importModlist(input.filepath);
    const modList = svc.getModList();
    const available = new Set(modList.allMods.map((m) => m.name));
    const valid = names.filter((n) => available.has(n));
    modList.setOrder(valid);
    svc.persistModList(modList);
    return {
      imported: valid.length,
      skipped: names.length - valid.length,
      mods: valid,
    };
  });

export const exportJson = os
  .input(
    z.object({
      filepath: z.string(),
      name: z.string().optional(),
    })
  )
  .handler(({ input }) => {
    const svc = getServices();
    const modList = svc.getModList();
    svc.modListIOService.exportModlist(
      modList.enabledModNames,
      input.filepath,
      input.name
    );
    return { success: true };
  });

export const importText = os
  .input(z.object({ filepath: z.string() }))
  .handler(({ input }) => {
    const svc = getServices();
    const names = svc.modListIOService.importModlistText(input.filepath);
    const modList = svc.getModList();
    const available = new Set(modList.allMods.map((m) => m.name));
    const valid = names.filter((n) => available.has(n));
    modList.setOrder(valid);
    svc.persistModList(modList);
    return { imported: valid.length, skipped: names.length - valid.length };
  });

export const exportText = os
  .input(z.object({ filepath: z.string() }))
  .handler(({ input }) => {
    const svc = getServices();
    const modList = svc.getModList();
    svc.modListIOService.exportModlistText(
      modList.enabledModNames,
      input.filepath
    );
    return { success: true };
  });
