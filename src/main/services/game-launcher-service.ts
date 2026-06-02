import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../models/config";
import type { ModList } from "../models/mod-list";
import { LaunchStrategyFactory } from "../strategies/launch-strategy";
import { PathStrategyFactory } from "../strategies/path-strategy";
import { PlatformFactory } from "../strategies/platform-strategy";
import { getLogger } from "../utils/logging";
import { DllInjectionService } from "./dll-injection-service";

function splitLaunchOptions(options: string): string[] {
  if (!options.trim()) {
    return [];
  }
  try {
    const result: string[] = [];
    let current = "";
    let inQuote = false;
    for (const char of options) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === " " && !inQuote) {
        if (current) {
          result.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    if (current) {
      result.push(current);
    }
    return result;
  } catch {
    return options.split(/\s+/);
  }
}

export class GameLauncherService {
  private readonly platform = PlatformFactory.create();
  private readonly dllInjectionService = new DllInjectionService();

  findExecutable(gameDir: string): string {
    for (const name of this.platform.getExecutableNames()) {
      const exePath = join(gameDir, name);
      if (existsSync(exePath)) {
        return exePath;
      }
    }
    return join(gameDir, this.platform.getExecutableNames()[0]);
  }

  buildExtraArgs(config: Config | null, _modList: ModList | null): string[] {
    if (!config) {
      return [];
    }
    const extraArgs: string[] = [];
    if (config.custom_launch_options) {
      extraArgs.push(...splitLaunchOptions(config.custom_launch_options));
    }
    if (config.dev_mode_enabled) {
      extraArgs.push("-dev_mode", "true");
    }
    if (config.debug_console_enabled) {
      extraArgs.push("-enable_debugconsole", "true");
    }
    return extraArgs;
  }

  launchGame(
    gameDir: string,
    modPaths: string[],
    config: Config | null,
    modList: ModList | null
  ): void {
    const exePath = this.findExecutable(gameDir);
    if (!existsSync(exePath)) {
      throw new Error(`Game executable not found: ${exePath}`);
    }

    const logger = getLogger();

    if (config?.dll_injection_enabled && modList) {
      const dllMods = this.dllInjectionService.scanForDllMods(modList);
      if (dllMods.length > 0) {
        logger.info(
          `Updating chainloader manifest for ${dllMods.length} mod(s) with DLLs`
        );
        this.dllInjectionService.updateChainloaderManifest(
          gameDir,
          config.mod_folder,
          dllMods
        );
      } else {
        this.dllInjectionService.clearChainloaderManifest(
          gameDir,
          config.mod_folder
        );
      }
    } else if (config) {
      this.dllInjectionService.clearChainloaderManifest(
        gameDir,
        config.mod_folder
      );
    }

    const launchStrategy = LaunchStrategyFactory.create(gameDir);
    const pathStrategy = PathStrategyFactory.create(gameDir);
    const extraArgs = this.buildExtraArgs(config, modList);
    const convertedPaths = pathStrategy.convertModPaths(modPaths, gameDir);

    logger.info(`Launch executable: ${exePath}`);
    for (const arg of extraArgs) {
      logger.info(`Launch extra arg: ${arg}`);
    }
    for (const p of convertedPaths) {
      logger.info(`Launch mod path: ${p}`);
    }

    launchStrategy.launch(exePath, convertedPaths, gameDir, extraArgs);
  }

  getLaunchOptions(
    gameDir: string,
    modPaths: string[],
    config: Config | null,
    modList: ModList | null
  ): string {
    const launchStrategy = LaunchStrategyFactory.create(gameDir);
    const pathStrategy = PathStrategyFactory.create(gameDir);
    const extraArgs = this.buildExtraArgs(config, modList);
    const convertedPaths = pathStrategy.convertModPaths(modPaths, gameDir);
    return launchStrategy.getLaunchOptions(convertedPaths, extraArgs);
  }

  exportBatFile(
    gameDir: string,
    modPaths: string[],
    outputPath: string,
    config: Config | null,
    modList: ModList | null
  ): string {
    const exePath = this.findExecutable(gameDir);
    const pathStrategy = PathStrategyFactory.create(gameDir);
    const extraArgs = this.buildExtraArgs(config, modList);
    const convertedPaths = pathStrategy.convertModPaths(modPaths, gameDir);

    const cmdParts = [`start "" "${exePath}"`];
    for (const arg of extraArgs) {
      cmdParts.push(String(arg).includes(" ") ? `"${arg}"` : String(arg));
    }
    if (convertedPaths.length > 0) {
      cmdParts.push("-modpaths");
      for (const p of convertedPaths) {
        cmdParts.push(`"${p}"`);
      }
    }

    const batContent =
      "@echo off\n" +
      "REM Mewism Auto-Generated Launch Script\n" +
      "REM This script launches Mewgenics with mods\n" +
      `${cmdParts.join(" ")}\n` +
      "exit\n";

    writeFileSync(outputPath, batContent, "utf-8");
    return `"${outputPath}" %command%`;
  }

  shouldWarnExternalMods(gameDir: string, modPaths: string[]): boolean {
    return PathStrategyFactory.create(gameDir).shouldWarnAboutExternalMods(
      modPaths,
      gameDir
    );
  }
}
