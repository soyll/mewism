import { readFileSync, writeFileSync } from "node:fs";

export class ModListIOService {
  exportModlist(
    enabledModNames: string[],
    filepath: string,
    modlistName = ""
  ): void {
    writeFileSync(
      filepath,
      JSON.stringify(
        { version: "1.0", mods: enabledModNames, name: modlistName },
        null,
        2
      ),
      "utf-8"
    );
  }

  importModlist(filepath: string): string[] {
    const data = JSON.parse(readFileSync(filepath, "utf-8"));
    if (typeof data === "object" && data !== null && "mods" in data) {
      return data.mods as string[];
    }
    if (Array.isArray(data)) {
      return data as string[];
    }
    throw new Error("Invalid modlist format");
  }

  getModlistName(filepath: string): string {
    const data = JSON.parse(readFileSync(filepath, "utf-8"));
    if (typeof data === "object" && data !== null) {
      return String(data.name ?? "");
    }
    return "";
  }

  exportModlistText(enabledModNames: string[], filepath: string): void {
    writeFileSync(filepath, `${enabledModNames.join("\n")}\n`, "utf-8");
  }

  importModlistText(filepath: string): string[] {
    return readFileSync(filepath, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
}
