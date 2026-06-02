import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { ModRepository } from "@/main/repositories/mod-repository";
import { ModService } from "@/main/services/mod-service";

describe("ModService", () => {
  const testDir = join(tmpdir(), `mewtator-test-${Date.now()}`);
  let repo: ModRepository;

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("loads mods from modlist and folders", () => {
    repo = new ModRepository(testDir);
    mkdirSync(join(testDir, "TestMod"), { recursive: true });
    writeFileSync(
      join(testDir, "TestMod", "description.json"),
      JSON.stringify({ title: "Test", version: "1.0.0" })
    );
    writeFileSync(join(testDir, "modlist.txt"), "TestMod\n");

    const service = new ModService(repo);
    const modList = service.loadMods();

    expect(modList.enabledMods).toHaveLength(1);
    expect(modList.enabledMods[0].title).toBe("Test");
    expect(modList.disabledMods).toHaveLength(0);
  });

  it("roundtrips modlist order", () => {
    repo = new ModRepository(testDir);
    mkdirSync(join(testDir, "A"), { recursive: true });
    mkdirSync(join(testDir, "B"), { recursive: true });
    writeFileSync(join(testDir, "modlist.txt"), "B\nA\n");

    const service = new ModService(repo);
    const modList = service.loadMods();
    service.saveModOrder(modList);

    expect(repo.loadEnabledModNames()).toEqual(["B", "A"]);
  });
});
