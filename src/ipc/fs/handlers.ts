import { dialog, shell } from "electron";
import { os } from "@orpc/server";
import { z } from "zod";
import { getServices } from "@/main/bootstrap";

export const openFolder = os
  .input(z.object({ path: z.string() }))
  .handler(({ input }) => {
    getServices().platform.openPath(input.path);
    return { success: true };
  });

export const openExternal = os
  .input(z.object({ url: z.string().url() }))
  .handler(async ({ input }) => {
    await shell.openExternal(input.url);
    return { success: true };
  });

export const pickFolder = os
  .input(z.object({ title: z.string().optional() }).optional())
  .handler(async ({ input }) => {
    const result = await dialog.showOpenDialog({
      title: input?.title ?? "Select Folder",
      properties: ["openDirectory"],
    });
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

export const pickFile = os
  .input(
    z.object({
      title: z.string().optional(),
      filters: z
        .array(z.object({ name: z.string(), extensions: z.array(z.string()) }))
        .optional(),
    }).optional()
  )
  .handler(async ({ input }) => {
    const result = await dialog.showOpenDialog({
      title: input?.title ?? "Select File",
      properties: ["openFile"],
      filters: input?.filters,
    });
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

export const pickSaveFile = os
  .input(
    z.object({
      title: z.string().optional(),
      defaultPath: z.string().optional(),
      filters: z
        .array(z.object({ name: z.string(), extensions: z.array(z.string()) }))
        .optional(),
    }).optional()
  )
  .handler(async ({ input }) => {
    const result = await dialog.showSaveDialog({
      title: input?.title ?? "Save File",
      defaultPath: input?.defaultPath,
      filters: input?.filters,
    });
    return result.canceled ? null : (result.filePath ?? null);
  });

export const pickInstallMod = os.handler(async () => {
  const result = await dialog.showOpenDialog({
    title: "Install Mod",
    properties: ["openFile", "openDirectory", "multiSelections"],
    filters: [{ name: "Mod Archives", extensions: ["zip"] }],
  });
  return result.canceled ? [] : result.filePaths;
});
