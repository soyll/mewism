import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { validateGameInstallDir } from "@/main/utils/game-path-validator";

describe("validateGameInstallDir", () => {
  const testDir = join(tmpdir(), `mewism-game-validate-${Date.now()}`);

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("accepts folder with Mewgenics.exe", () => {
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, "Mewgenics.exe"), "");

    const result = validateGameInstallDir(testDir);
    expect(result.valid).toBe(true);
    expect(result.executablePath).toContain("Mewgenics.exe");
  });

  it("rejects folder without game executable", () => {
    mkdirSync(testDir, { recursive: true });
    writeFileSync(join(testDir, "readme.txt"), "not a game");

    expect(validateGameInstallDir(testDir).valid).toBe(false);
  });

  it("rejects missing path", () => {
    expect(validateGameInstallDir("").valid).toBe(false);
    expect(validateGameInstallDir(join(testDir, "nope")).valid).toBe(false);
  });
});
