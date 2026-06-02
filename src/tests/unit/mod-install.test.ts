import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import AdmZip from "adm-zip";
import { afterEach, describe, expect, it } from "vitest";
import { ModInstallService } from "@/main/services/mod-install-service";

describe("ModInstallService", () => {
  const testDir = join(tmpdir(), `mewtator-install-${Date.now()}`);

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("installs mod from folder", async () => {
    mkdirSync(testDir, { recursive: true });
    const sourceMod = join(testDir, "source", "MyMod");
    mkdirSync(sourceMod, { recursive: true });
    writeFileSync(
      join(sourceMod, "description.json"),
      JSON.stringify({ title: "My Mod", version: "1.0.0" })
    );

    const service = new ModInstallService(testDir);
    const result = await service.install(sourceMod, "folder");
    expect(result.modName).toBe("MyMod");
    expect(existsSync(join(testDir, "MyMod", "description.json"))).toBe(true);
  });

  it("installs mod from zip with single folder", async () => {
    mkdirSync(testDir, { recursive: true });
    const zipPath = join(testDir, "ZipMod.zip");
    const staging = join(testDir, "staging");
    const modRoot = join(staging, "ZipMod");
    mkdirSync(modRoot, { recursive: true });
    writeFileSync(
      join(modRoot, "description.json"),
      JSON.stringify({ title: "Zip Mod" })
    );

    const zip = new AdmZip();
    zip.addLocalFolder(modRoot, "ZipMod");
    zip.writeZip(zipPath);

    const service = new ModInstallService(testDir);
    const result = await service.install(zipPath, "zip");
    expect(result.modName).toBe("ZipMod");
  });
});
