import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { PlatformFactory } from "../strategies/platform-strategy";

const FALLBACK_EXECUTABLES = [
  "Mewgenics.exe",
  "Mewgenics",
  "Mewgenics.x86_64",
  "Mewgenics.x86",
  "Mewgenics.app",
];

export type GamePathValidation = {
  valid: boolean;
  executablePath: string | null;
};

function isExistingEntry(path: string): boolean {
  try {
    return existsSync(path);
  } catch {
    return false;
  }
}

export function validateGameInstallDir(gameDir: string): GamePathValidation {
  if (!gameDir.trim()) {
    return { valid: false, executablePath: null };
  }

  try {
    if (!existsSync(gameDir)) {
      return { valid: false, executablePath: null };
    }
    if (!statSync(gameDir).isDirectory()) {
      return { valid: false, executablePath: null };
    }
  } catch {
    return { valid: false, executablePath: null };
  }

  const platformNames = PlatformFactory.create().getExecutableNames();
  const candidates = [...new Set([...platformNames, ...FALLBACK_EXECUTABLES])];

  for (const name of candidates) {
    const candidatePath = join(gameDir, name);
    if (isExistingEntry(candidatePath)) {
      return { valid: true, executablePath: candidatePath };
    }
  }

  const macBundleExe = join(
    gameDir,
    "Mewgenics.app",
    "Contents",
    "MacOS",
    "Mewgenics"
  );
  if (isExistingEntry(macBundleExe)) {
    return { valid: true, executablePath: macBundleExe };
  }

  return { valid: false, executablePath: null };
}
