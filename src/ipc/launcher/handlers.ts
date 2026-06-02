import { os } from "@orpc/server";
import { z } from "zod";
import { getServices } from "@/main/bootstrap";

export const preflight = os.handler(() => {
  const svc = getServices();
  const config = svc.getConfig();
  const modList = svc.getModList();
  const missing = svc.modService!.getMissingModNames(modList);
  const requirementErrors = svc.modService!.validateRequirements(modList);
  const enabledPaths = svc.modService!.getEnabledModPaths(modList);
  const protonWarning =
    config.game_install_dir &&
    svc.gameLauncherService.shouldWarnExternalMods(
      config.game_install_dir,
      enabledPaths
    );

  let dllWarning: string | null = null;
  if (svc.dllInjectionService.hasDllMods(modList)) {
    if (!config.dll_injection_enabled) {
      dllWarning = "DLL mods enabled but DLL injection is disabled in settings.";
    } else if (
      config.game_install_dir &&
      !svc.dllInjectionService.chainloaderExists(config.game_install_dir)
    ) {
      dllWarning =
        "chainloader.ini was not found. Install Mewjector for DLL mods to work.";
    }
  }

  return {
    canLaunch: missing.length === 0,
    missingMods: missing,
    requirementErrors,
    protonWarning: Boolean(protonWarning),
    dllWarning,
  };
});

export const launch = os
  .input(
    z.object({
      skipRequirementWarnings: z.boolean().optional(),
      skipProtonWarning: z.boolean().optional(),
    })
  )
  .handler(({ input }) => {
    const svc = getServices();
    const config = svc.getConfig();

    if (!config.game_install_dir) {
      throw new Error("Game install directory is not configured.");
    }

    const modList = svc.getModList();
    const missing = svc.modService!.getMissingModNames(modList);
    if (missing.length > 0) {
      throw new Error(`Missing mods: ${missing.join(", ")}`);
    }

    const requirementErrors = svc.modService!.validateRequirements(modList);
    if (requirementErrors.length > 0 && !input.skipRequirementWarnings) {
      throw new Error(`REQUIREMENTS:${requirementErrors.join("\n")}`);
    }

    const enabledPaths = svc.modService!.getEnabledModPaths(modList);
    if (
      !input.skipProtonWarning &&
      svc.gameLauncherService.shouldWarnExternalMods(
        config.game_install_dir,
        enabledPaths
      )
    ) {
      throw new Error("PROTON_WARNING");
    }

    svc.gameLauncherService.launchGame(
      config.game_install_dir,
      enabledPaths,
      config,
      modList
    );

    return { closeOnLaunch: config.close_on_launch };
  });

export const getLaunchOptions = os.handler(() => {
  const svc = getServices();
  const config = svc.getConfig();
  const modList = svc.getModList();
  const paths = svc.modService!.getEnabledModPaths(modList);
  return svc.gameLauncherService.getLaunchOptions(
    config.game_install_dir,
    paths,
    config,
    modList
  );
});

export const exportBat = os
  .input(z.object({ outputPath: z.string() }))
  .handler(({ input }) => {
    const svc = getServices();
    const config = svc.getConfig();
    const modList = svc.getModList();
    const paths = svc.modService!.getEnabledModPaths(modList);
    const steamOption = svc.gameLauncherService.exportBatFile(
      config.game_install_dir,
      paths,
      input.outputPath,
      config,
      modList
    );
    return { steamOption };
  });
