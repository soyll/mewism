import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import type { Mod } from "../models/mod";
import type { ModList } from "../models/mod-list";

export class DllInjectionService {
  static readonly CHAINLOADER_INI = "chainloader.ini";
  static readonly MANIFEST_FILE = "mewtator_dll_manifest.txt";

  chainloaderExists(gameDir: string): boolean {
    return existsSync(join(gameDir, DllInjectionService.CHAINLOADER_INI));
  }

  scanForDllMods(modList: ModList): [string, string[]][] {
    const dllMods: [string, string[]][] = [];
    for (const mod of modList.enabledMods) {
      const dllFiles = this.findDllsInMod(mod);
      if (dllFiles.length > 0) {
        dllMods.push([mod.name, dllFiles]);
      }
    }
    return dllMods;
  }

  hasDllMods(modList: ModList): boolean {
    return modList.enabledMods.some((m) => this.findDllsInMod(m).length > 0);
  }

  modHasDlls(mod: Mod): boolean {
    return this.findDllsInMod(mod).length > 0;
  }

  findDllsInMod(mod: Mod): string[] {
    if (!existsSync(mod.path)) {
      return [];
    }

    const dllFiles: string[] = [];
    const collect = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          collect(full);
        } else if (entry.name.toLowerCase().endsWith(".dll")) {
          dllFiles.push(full.replaceAll("\\", "/"));
        }
      }
    };
    collect(mod.path);

    if (mod.dll_order) {
      const dllMap = new Map(
        dllFiles.map((d) => [basename(d).toLowerCase(), d])
      );
      const ordered: string[] = [];
      for (const name of mod.dll_order) {
        const key = name.toLowerCase();
        const path = dllMap.get(key);
        if (path) {
          ordered.push(path);
          dllMap.delete(key);
        }
      }
      ordered.push(
        ...[...dllMap.values()].sort((a, b) =>
          basename(a).toLowerCase().localeCompare(basename(b).toLowerCase())
        )
      );
      return ordered;
    }

    return dllFiles.sort((a, b) =>
      basename(a).toLowerCase().localeCompare(basename(b).toLowerCase())
    );
  }

  updateChainloaderManifest(
    gameDir: string,
    modFolder: string,
    dllMods: [string, string[]][]
  ): boolean {
    const iniPath = join(gameDir, DllInjectionService.CHAINLOADER_INI);
    const manifestPath = join(modFolder, DllInjectionService.MANIFEST_FILE);

    if (!existsSync(iniPath)) {
      return false;
    }

    try {
      const lines: string[] = [];
      for (const [, dllPaths] of dllMods) {
        for (const dllPath of dllPaths) {
          lines.push(`${dllPath}\n`);
        }
      }
      writeFileSync(manifestPath, lines.join(""), "utf-8");

      const manifestLine = `MewtatorManifest=${manifestPath.replaceAll("\\", "/")}\n`;
      const iniLines = readFileSync(iniPath, "utf-8").split("\n");
      let inChainloader = false;
      let manifestFound = false;

      for (let i = 0; i < iniLines.length; i++) {
        const stripped = iniLines[i].trim();
        if (stripped.startsWith("[")) {
          inChainloader = stripped.toLowerCase() === "[chainloader]";
        } else if (
          inChainloader &&
          stripped.toLowerCase().startsWith("mewtatormanifest")
        ) {
          iniLines[i] = manifestLine.trimEnd();
          manifestFound = true;
          break;
        }
      }

      if (!manifestFound) {
        for (let i = 0; i < iniLines.length; i++) {
          if (iniLines[i].trim().toLowerCase() === "[chainloader]") {
            iniLines.splice(i + 1, 0, manifestLine.trimEnd());
            break;
          }
        }
      }

      writeFileSync(iniPath, `${iniLines.join("\n")}\n`, "utf-8");
      return true;
    } catch {
      return false;
    }
  }

  clearChainloaderManifest(gameDir: string, modFolder: string): boolean {
    const iniPath = join(gameDir, DllInjectionService.CHAINLOADER_INI);
    const manifestPath = join(modFolder, DllInjectionService.MANIFEST_FILE);

    if (!existsSync(iniPath)) {
      return true;
    }

    try {
      const iniLines = readFileSync(iniPath, "utf-8").split("\n");
      let inChainloader = false;

      for (let i = 0; i < iniLines.length; i++) {
        const stripped = iniLines[i].trim();
        if (stripped.startsWith("[")) {
          inChainloader = stripped.toLowerCase() === "[chainloader]";
        } else if (
          inChainloader &&
          stripped.toLowerCase().startsWith("mewtatormanifest")
        ) {
          iniLines[i] = "MewtatorManifest=";
          break;
        }
      }

      writeFileSync(iniPath, `${iniLines.join("\n")}\n`, "utf-8");

      if (existsSync(manifestPath)) {
        unlinkSync(manifestPath);
      }
      return true;
    } catch {
      return false;
    }
  }

  isChainloaderConfigured(gameDir: string): boolean {
    const iniPath = join(gameDir, DllInjectionService.CHAINLOADER_INI);
    if (!existsSync(iniPath)) {
      return false;
    }

    try {
      let inChainloader = false;
      for (const line of readFileSync(iniPath, "utf-8").split("\n")) {
        const stripped = line.trim();
        if (stripped.startsWith("[")) {
          inChainloader = stripped.toLowerCase() === "[chainloader]";
        } else if (
          inChainloader &&
          stripped.toLowerCase().startsWith("mewtatormanifest")
        ) {
          const value = stripped.split("=", 2)[1]?.trim() ?? "";
          return Boolean(value);
        }
      }
    } catch {
      return false;
    }
    return false;
  }
}
