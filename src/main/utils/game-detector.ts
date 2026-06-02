import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, normalize } from "node:path";

function checkSteamLibraries(steamPath: string): string {
  const candidates = [join(steamPath, "steamapps", "common", "Mewgenics")];
  const libVdf = join(steamPath, "steamapps", "libraryfolders.vdf");

  if (existsSync(libVdf)) {
    try {
      const content = readFileSync(libVdf, "utf-8");
      for (const line of content.split("\n")) {
        if (!line.toLowerCase().includes('"path"')) {
          continue;
        }
        const parts = line.split('"');
        for (let i = parts.length - 1; i >= 0; i--) {
          const part = parts[i].trim();
          if (
            part &&
            (part.startsWith("/") ||
              part.startsWith("\\") ||
              (part.includes(":") && part.length > 2))
          ) {
            candidates.push(
              join(normalize(part), "steamapps", "common", "Mewgenics")
            );
            break;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  for (const c of candidates) {
    if (existsSync(c)) {
      return c;
    }
  }
  return "";
}

export function autoDetectGameInstall(): string {
  const steamPaths: string[] = [];

  if (process.platform === "win32") {
    steamPaths.push(
      "C:\\Program Files (x86)\\Steam",
      "C:\\Program Files\\Steam",
      join(homedir(), "Steam")
    );
  } else if (process.platform === "darwin") {
    steamPaths.push(
      join(homedir(), "Library", "Application Support", "Steam"),
      join(homedir(), ".steam", "steam")
    );
  } else {
    steamPaths.push(
      join(homedir(), ".local", "share", "Steam"),
      join(homedir(), ".steam", "steam"),
      "/home/deck/.local/share/Steam"
    );
  }

  for (const steamPath of steamPaths) {
    if (existsSync(steamPath)) {
      const result = checkSteamLibraries(steamPath);
      if (result) {
        return result;
      }
    }
  }

  return "";
}

export function detectSteamAppId(gameDir: string): string {
  if (!gameDir) {
    return "";
  }

  try {
    const parts = gameDir.split(/[/\\]/);
    const mewIdx = parts.lastIndexOf("Mewgenics");
    if (mewIdx < 0 || parts[mewIdx - 1] !== "common") {
      return "";
    }
    const steamappsDir = join(...parts.slice(0, mewIdx - 1));

    if (!existsSync(steamappsDir)) {
      return "";
    }

    for (const name of readdirSync(steamappsDir)) {
      if (!name.startsWith("appmanifest_") || !name.endsWith(".acf")) {
        continue;
      }
      try {
        const content = readFileSync(join(steamappsDir, name), "utf-8");
        if (!content.toLowerCase().includes("mewgenics")) {
          continue;
        }
        const match = name.match(/appmanifest_(\d+)\.acf/);
        if (match) {
          return match[1];
        }
        const appIdMatch = content.match(/"appid"\s+"(\d+)"/);
        if (appIdMatch) {
          return appIdMatch[1];
        }
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }

  return "";
}
