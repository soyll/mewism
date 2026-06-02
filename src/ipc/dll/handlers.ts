import { os } from "@orpc/server";
import { getServices } from "@/main/bootstrap";

export const cleanup = os.handler(() => {
  const svc = getServices();
  const config = svc.getConfig();
  if (!config.game_install_dir) {
    throw new Error("Game directory not configured");
  }
  const ok = svc.dllInjectionService.clearChainloaderManifest(
    config.game_install_dir,
    config.mod_folder
  );
  return { success: ok };
});

export const getStatus = os.handler(() => {
  const svc = getServices();
  const config = svc.getConfig();
  const modList = svc.getModList();
  return {
    hasDllMods: svc.dllInjectionService.hasDllMods(modList),
    chainloaderExists: config.game_install_dir
      ? svc.dllInjectionService.chainloaderExists(config.game_install_dir)
      : false,
    configured: config.game_install_dir
      ? svc.dllInjectionService.isChainloaderConfigured(
          config.game_install_dir
        )
      : false,
    injectionEnabled: config.dll_injection_enabled,
  };
});
