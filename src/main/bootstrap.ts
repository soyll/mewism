import { join } from "node:path";
import { app } from "electron";
import { Config } from "./models/config";
import { ModList } from "./models/mod-list";
import { ConfigRepository } from "./repositories/config-repository";
import { ModRepository } from "./repositories/mod-repository";
import { ConfigService } from "./services/config-service";
import { DllInjectionService } from "./services/dll-injection-service";
import { GameLauncherService } from "./services/game-launcher-service";
import {
  ModInstallService,
  createModInstallService,
} from "./services/mod-install-service";
import { ModListIOService } from "./services/modlist-io-service";
import { ModService } from "./services/mod-service";
import { PackService } from "./services/pack-service";
import { PlatformFactory } from "./strategies/platform-strategy";
import { initLogging } from "./utils/logging";

export class AppServices {
  configPath: string;
  configService: ConfigService;
  configRepository: ConfigRepository;
  modRepository: ModRepository | null = null;
  modService: ModService | null = null;
  modInstallService: ModInstallService | null = null;
  modListIOService = new ModListIOService();
  gameLauncherService = new GameLauncherService();
  dllInjectionService = new DllInjectionService();
  packService = new PackService();
  platform = PlatformFactory.create();

  private _modList: ModList | null = null;
  private _lastMtime = 0;
  private _lastFolders: string[] = [];

  constructor() {
    const userData = app.getPath("userData");
    initLogging(join(userData, "logs"));
    this.configPath = join(userData, "config.json");
    this.configRepository = new ConfigRepository(this.configPath);
    this.configService = new ConfigService(this.configRepository);
    this.refreshModServices();
  }

  refreshModServices(): void {
    const config = this.configService.loadConfig();
    if (!config.mod_folder) {
      config.mod_folder = join(app.getPath("userData"), "mods");
      this.configService.saveConfig(config);
    }
    this.modRepository = new ModRepository(config.mod_folder);
    this.modService = new ModService(this.modRepository);
    this.modInstallService = createModInstallService(config.mod_folder);
    this._modList = this.modService.loadMods();
    this.syncWatchState();
  }

  getConfig(): Config {
    return this.configService.loadConfig();
  }

  saveConfig(config: Config): void {
    this.configService.saveConfig(config);
    this.refreshModServices();
  }

  getModList(): ModList {
    if (!this.modService) {
      this.refreshModServices();
    }
    this._modList = this.modService!.loadMods();
    return this._modList;
  }

  persistModList(modList: ModList): void {
    this.modService!.saveModOrder(modList);
    this._modList = modList;
    this.syncWatchState();
  }

  syncWatchState(): void {
    if (!this.modRepository) {
      return;
    }
    this._lastMtime = this.modRepository.getModlistMtime();
    this._lastFolders = this.modRepository.getFolderSnapshot();
  }

  checkExternalChanges(): boolean {
    if (!this.modRepository) {
      return false;
    }
    const mtime = this.modRepository.getModlistMtime();
    const folders = this.modRepository.getFolderSnapshot();
    if (
      mtime !== this._lastMtime ||
      folders.join("|") !== this._lastFolders.join("|")
    ) {
      this.syncWatchState();
      return true;
    }
    return false;
  }
}

let services: AppServices | null = null;

export function getServices(): AppServices {
  if (!services) {
    services = new AppServices();
  }
  return services;
}
