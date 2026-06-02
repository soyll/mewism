import { join } from "node:path";
import { os } from "@orpc/server";
import { getServices } from "@/main/bootstrap";

export const getProgress = os.handler(() => packProgress);

export const unpack = os.handler(async () => {
  const svc = getServices();
  const config = svc.getConfig();
  if (!config.game_install_dir) {
    throw new Error("Game directory not configured");
  }
  const outputDir = join(config.mod_folder, "_unpacked");
  packProgress = { current: 0, total: 0, running: true, error: null };
  try {
    await svc.packService.unpack(
      config.game_install_dir,
      outputDir,
      (current, total) => {
        packProgress = { current, total, running: true, error: null };
      }
    );
    packProgress.running = false;
    return { outputDir, success: true };
  } catch (e) {
    packProgress = {
      current: 0,
      total: 0,
      running: false,
      error: e instanceof Error ? e.message : String(e),
    };
    throw e;
  }
});

export const repack = os.handler(async () => {
  const svc = getServices();
  const config = svc.getConfig();
  if (!config.game_install_dir) {
    throw new Error("Game directory not configured");
  }
  const sourceDir = join(config.mod_folder, "_unpacked");
  const outputGpak = join(config.game_install_dir, "resources.gpak");
  packProgress = { current: 0, total: 0, running: true, error: null };
  try {
    await svc.packService.repack(sourceDir, outputGpak, (current, total) => {
      packProgress = { current, total, running: true, error: null };
    });
    packProgress.running = false;
    return { success: true };
  } catch (e) {
    packProgress = {
      current: 0,
      total: 0,
      running: false,
      error: e instanceof Error ? e.message : String(e),
    };
    throw e;
  }
});
