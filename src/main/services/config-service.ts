import { join } from "node:path";
import { app } from "electron";
import { Config } from "../models/config";
import { ConfigRepository } from "../repositories/config-repository";

export class ConfigService {
  constructor(private readonly repository: ConfigRepository) {}

  loadConfig(): Config {
    let config = this.repository.load();
    if (!config) {
      config = new Config();
    }
    if (!config.mod_folder) {
      config.mod_folder = join(app.getPath("userData"), "mods");
    }
    config.normalizePaths();
    return config;
  }

  saveConfig(config: Config): void {
    config.normalizePaths();
    this.repository.save(config);
  }

  validateConfig(config: Config): boolean {
    return config.isValid();
  }
}
