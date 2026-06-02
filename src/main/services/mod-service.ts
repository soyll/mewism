import { Mod } from "../models/mod";
import { ModList } from "../models/mod-list";
import type { ModRepository } from "../repositories/mod-repository";
import {
  checkRequirement,
  parseRequirement,
} from "../utils/version-parser";
import type { Config } from "../models/config";

export class ModService {
  constructor(private readonly repository: ModRepository) {}

  loadMods(): ModList {
    const enabledNames = this.repository.loadEnabledModNames();
    const enabledSet = new Set(enabledNames);
    const folderMods = this.repository.getModFolders();
    const mods: Mod[] = [];

    for (const name of enabledNames) {
      const exists = this.repository.modExists(name);
      const { metadata, previewPath } = exists
        ? this.repository.loadModMetadata(name)
        : { metadata: {}, previewPath: null };

      mods.push(
        new Mod({
          name,
          path: this.repository.getModPath(name),
          enabled: true,
          missing: !exists,
          metadata,
          preview_path: previewPath,
        })
      );
    }

    for (const name of folderMods) {
      if (enabledSet.has(name)) {
        continue;
      }
      const { metadata, previewPath } = this.repository.loadModMetadata(name);
      mods.push(
        new Mod({
          name,
          path: this.repository.getModPath(name),
          enabled: false,
          metadata,
          preview_path: previewPath,
        })
      );
    }

    return new ModList(mods);
  }

  saveModOrder(modList: ModList): void {
    this.repository.saveEnabledModNames(modList.enabledModNames);
  }

  getEnabledModPaths(modList: ModList): string[] {
    return modList.enabledMods.map((m) => m.path);
  }

  getMissingModNames(modList: ModList): string[] {
    return modList.missingMods.map((m) => m.name);
  }

  validateRequirements(modList: ModList): string[] {
    const errors: string[] = [];
    const enabledMods = modList.enabledMods;
    const modPositions = new Map(
      enabledMods.map((m, idx) => [m.name, idx])
    );
    const modVersions = new Map(enabledMods.map((m) => [m.name, m.version]));

    for (const [idx, mod] of enabledMods.entries()) {
      mod.has_unmet_requirements = false;
      if (mod.requirements.length === 0) {
        continue;
      }

      for (const reqItem of mod.requirements) {
        let reqString = "";
        if (typeof reqItem === "object" && reqItem !== null) {
          const obj = reqItem as Record<string, string>;
          reqString = obj.mod ?? "";
          if (obj.version) {
            reqString += obj.version;
          }
        } else if (typeof reqItem === "string") {
          reqString = reqItem;
        } else {
          continue;
        }

        const parsed = parseRequirement(reqString);
        if (!parsed) {
          errors.push(`${mod.name}: Invalid requirement format '${reqString}'`);
          mod.has_unmet_requirements = true;
          continue;
        }

        const [reqModName, operator, reqVersion] = parsed;

        if (!modPositions.has(reqModName)) {
          errors.push(
            `${mod.name}: Required mod '${reqModName}' is not enabled`
          );
          mod.has_unmet_requirements = true;
          continue;
        }

        const reqPosition = modPositions.get(reqModName)!;
        if (reqPosition > idx) {
          errors.push(
            `${mod.name}: Required mod '${reqModName}' must be loaded before this mod (move it up in the list)`
          );
          mod.has_unmet_requirements = true;
          continue;
        }

        if (operator && reqVersion) {
          const reqModVersion = modVersions.get(reqModName) ?? "";
          if (!checkRequirement(reqModVersion, operator, reqVersion)) {
            errors.push(
              `${mod.name}: Required mod '${reqModName}' version ${reqModVersion} does not satisfy ${operator}${reqVersion}`
            );
            mod.has_unmet_requirements = true;
          }
        }
      }
    }

    return errors;
  }

  detectConflicts(_modList: ModList, _config: Config): string[] {
    return [];
  }

  autoSort(modList: ModList): { sortedNames: string[]; warnings: string[] } {
    const warnings: string[] = [];
    const enabledMods = modList.enabledMods;
    if (enabledMods.length === 0) {
      return { sortedNames: [], warnings };
    }

    const sortedMods = [...enabledMods].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    const dependencies = new Map<string, string[]>();
    for (const mod of sortedMods) {
      const deps: string[] = [];
      for (const reqItem of mod.requirements) {
        let reqString = "";
        if (typeof reqItem === "object" && reqItem !== null) {
          reqString = (reqItem as Record<string, string>).mod ?? "";
        } else if (typeof reqItem === "string") {
          reqString = reqItem;
        }
        const parsed = parseRequirement(reqString);
        if (parsed) {
          deps.push(parsed[0]);
        }
      }
      dependencies.set(mod.name, deps);
    }

    const modNames = sortedMods.map((m) => m.name);
    let changed = true;
    let iterations = 0;
    const maxIterations = modNames.length * modNames.length;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (let i = 0; i < modNames.length; i++) {
        const modName = modNames[i];
        const deps = dependencies.get(modName);
        if (!deps) {
          continue;
        }

        for (const depName of deps) {
          const depIdx = modNames.indexOf(depName);
          if (depIdx < 0 || depIdx <= i) {
            continue;
          }
          modNames.splice(depIdx, 1);
          modNames.splice(i, 0, depName);
          changed = true;
          break;
        }
        if (changed) {
          break;
        }
      }
    }

    if (iterations >= maxIterations) {
      warnings.push(
        "Circular dependencies detected. Some requirements may not be satisfied."
      );
    }

    return { sortedNames: modNames, warnings };
  }
}
