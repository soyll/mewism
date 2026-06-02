import { existsSync } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, dirname, extname, join, normalize, sep } from "node:path";
import AdmZip from "adm-zip";
import { copy } from "fs-extra";

const DESC_FILENAMES = ["description.json", "info.json", "modinfo.json"];

export type InstallResult = {
  modName: string;
  replaced: boolean;
};

export type InstallConflict = {
  modName: string;
  sourcePath: string;
  type: "zip" | "folder";
};

export class ModInstallService {
  constructor(private readonly modFolder: string) {}

  async install(
    sourcePath: string,
    type: "zip" | "folder",
    replace = false
  ): Promise<InstallResult> {
    const normalizedSource = normalize(sourcePath);
    const modRoot =
      type === "zip"
        ? await this.extractZipToTemp(normalizedSource)
        : normalizedSource;

    const resolved = await this.resolveModRoot(modRoot, type, normalizedSource);
    const modName = basename(resolved);
    const destPath = join(this.modFolder, modName);

    if (!this.isPathInsideModFolder(destPath)) {
      throw new Error("Invalid mod destination path");
    }

    if (existsSync(destPath)) {
      if (!replace) {
        throw new Error(`CONFLICT:${modName}`);
      }
      await rm(destPath, { recursive: true, force: true });
    }

    await copy(resolved, destPath, { overwrite: true });

    if (type === "zip" && resolved !== modRoot) {
      const parent = dirname(resolved);
      if (parent.includes("_install_temp")) {
        await rm(parent, { recursive: true, force: true }).catch(() => {});
      }
    }

    return { modName, replaced: replace && existsSync(destPath) };
  }

  checkConflict(sourcePath: string, type: "zip" | "folder"): InstallConflict | null {
    try {
      const modName = basename(normalize(sourcePath), extname(sourcePath));
      const destPath = join(this.modFolder, modName);
      if (existsSync(destPath)) {
        return { modName, sourcePath, type };
      }
    } catch {
      // ignore
    }
    return null;
  }

  private async extractZipToTemp(zipPath: string): Promise<string> {
    const tempDir = join(this.modFolder, "_install_temp", Date.now().toString());
    await mkdir(tempDir, { recursive: true });
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tempDir, true);
    return tempDir;
  }

  private async resolveModRoot(
    root: string,
    type: "zip" | "folder",
    originalSource: string
  ): Promise<string> {
    const entries = await readdir(root, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory());
    const files = entries.filter((e) => e.isFile());

    if (dirs.length === 1 && files.length === 0) {
      return join(root, dirs[0].name);
    }

    for (const filename of DESC_FILENAMES) {
      if (files.some((f) => f.name === filename)) {
        if (type === "zip") {
          const modName = basename(originalSource, extname(originalSource));
          const subDir = join(root, modName);
          await mkdir(subDir, { recursive: true });
          for (const entry of entries) {
            const src = join(root, entry.name);
            const dest = join(subDir, entry.name);
            if (entry.isDirectory()) {
              await copy(src, dest);
            } else {
              await copy(src, dest);
            }
          }
          return subDir;
        }
        return root;
      }
    }

    if (type === "folder") {
      return root;
    }

    if (dirs.length > 1) {
      throw new Error(
        "Archive contains multiple folders. Please zip a single mod folder."
      );
    }

    throw new Error("Could not determine mod root from archive.");
  }

  private isPathInsideModFolder(targetPath: string): boolean {
    const normalizedMod = normalize(this.modFolder);
    const normalizedTarget = normalize(targetPath);
    return (
      normalizedTarget.startsWith(normalizedMod + sep) ||
      normalizedTarget === normalizedMod
    );
  }
}

export function createModInstallService(modFolder: string): ModInstallService {
  return new ModInstallService(modFolder);
}

export async function getPathType(sourcePath: string): Promise<"zip" | "folder"> {
  const s = await stat(sourcePath);
  if (s.isDirectory()) {
    return "folder";
  }
  if (sourcePath.toLowerCase().endsWith(".zip")) {
    return "zip";
  }
  throw new Error("Unsupported file type. Use .zip or a folder.");
}
