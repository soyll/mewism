import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { Config } from "../models/config";

export class ConfigRepository {
  constructor(private readonly configPath: string) {}

  load(): Config | null {
    if (!existsSync(this.configPath)) {
      this.save(new Config());
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(this.configPath, "utf-8"));
      const config = Config.fromDict(data);
      config.normalizePaths();
      return config;
    } catch {
      this.save(new Config());
      return null;
    }
  }

  save(config: Config): void {
    writeFileSync(
      this.configPath,
      JSON.stringify(config.toDict(), null, 4),
      "utf-8"
    );
  }
}
