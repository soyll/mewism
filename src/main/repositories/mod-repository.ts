import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { ModMetadata } from "../models/mod";

const DESC_FILENAMES = ["description.json", "info.json", "modinfo.json"];
const PREVIEW_EXTS = new Set(["png", "jpg", "jpeg", "webp"]);

export class ModRepository {
  modlistPath: string;

  constructor(public modFolder: string) {
    this.modlistPath = join(modFolder, "modlist.txt");
    this.ensureFolderStructure();
  }

  ensureFolderStructure(): void {
    if (!existsSync(this.modFolder)) {
      mkdirSync(this.modFolder, { recursive: true });
    }
    if (!existsSync(this.modlistPath)) {
      writeFileSync(this.modlistPath, "", "utf-8");
    }
  }

  loadEnabledModNames(): string[] {
    if (!existsSync(this.modlistPath)) {
      return [];
    }
    return readFileSync(this.modlistPath, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  saveEnabledModNames(modNames: string[]): void {
    writeFileSync(this.modlistPath, `${modNames.join("\n")}\n`, "utf-8");
  }

  getModFolders(): string[] {
    if (!existsSync(this.modFolder)) {
      return [];
    }
    return readdirSync(this.modFolder)
      .filter((d) => {
        const full = join(this.modFolder, d);
        return statSync(full).isDirectory() && !d.startsWith("_");
      })
      .sort();
  }

  loadModMetadata(modName: string): {
    metadata: ModMetadata;
    previewPath: string | null;
  } {
    const modPath = join(this.modFolder, modName);
    if (!existsSync(modPath)) {
      return { metadata: {}, previewPath: null };
    }

    let metadata: ModMetadata = {};
    for (const filename of DESC_FILENAMES) {
      const descPath = join(modPath, filename);
      if (existsSync(descPath)) {
        try {
          metadata = JSON.parse(readFileSync(descPath, "utf-8"));
        } catch {
          metadata = {};
        }
        break;
      }
    }

    let previewPath: string | null = null;
    for (const name of readdirSync(modPath)) {
      const ext = name.toLowerCase().split(".").pop() ?? "";
      if (name.toLowerCase().startsWith("preview") && PREVIEW_EXTS.has(ext)) {
        previewPath = join(modPath, name);
        break;
      }
    }

    return { metadata, previewPath };
  }

  modExists(modName: string): boolean {
    return existsSync(join(this.modFolder, modName));
  }

  getModPath(modName: string): string {
    return join(this.modFolder, modName);
  }

  getModlistMtime(): number {
    if (existsSync(this.modlistPath)) {
      return statSync(this.modlistPath).mtimeMs;
    }
    return 0;
  }

  getFolderSnapshot(): string[] {
    return this.getModFolders();
  }
}
