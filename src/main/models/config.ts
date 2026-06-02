import { existsSync } from "node:fs";
import { normalize } from "node:path";
import { validateGameInstallDir } from "../utils/game-path-validator";

export type ConfigData = {
  game_install_dir: string;
  mod_folder: string;
  language: string;
  theme: string;
  custom_launch_options: string;
  dev_mode_enabled: boolean;
  debug_console_enabled: boolean;
  close_on_launch: boolean;
  dll_injection_enabled: boolean;
  onboarding_completed: boolean;
};

export class Config {
  game_install_dir = "";
  mod_folder = "";
  language = "English";
  theme = "system";
  custom_launch_options = "";
  dev_mode_enabled = false;
  debug_console_enabled = false;
  close_on_launch = false;
  dll_injection_enabled = false;
  onboarding_completed = false;

  isValid(): boolean {
    return Boolean(
      this.game_install_dir &&
        this.mod_folder &&
        existsSync(this.mod_folder) &&
        validateGameInstallDir(this.game_install_dir).valid
    );
  }

  normalizePaths(): void {
    if (this.game_install_dir) {
      this.game_install_dir = normalize(this.game_install_dir);
    }
    if (this.mod_folder) {
      this.mod_folder = normalize(this.mod_folder);
    }
  }

  toDict(): ConfigData {
    return {
      game_install_dir: this.game_install_dir,
      mod_folder: this.mod_folder,
      language: this.language,
      theme: this.theme,
      custom_launch_options: this.custom_launch_options,
      dev_mode_enabled: this.dev_mode_enabled,
      debug_console_enabled: this.debug_console_enabled,
      close_on_launch: this.close_on_launch,
      dll_injection_enabled: this.dll_injection_enabled,
      onboarding_completed: this.onboarding_completed,
    };
  }

  static fromDict(data: Partial<ConfigData>): Config {
    const config = new Config();
    config.game_install_dir = data.game_install_dir ?? "";
    config.mod_folder = data.mod_folder ?? "";
    config.language = data.language ?? "English";
    config.theme = data.theme ?? "system";
    config.custom_launch_options = data.custom_launch_options ?? "";
    config.dev_mode_enabled = data.dev_mode_enabled ?? false;
    config.debug_console_enabled = data.debug_console_enabled ?? false;
    config.close_on_launch = data.close_on_launch ?? false;
    config.dll_injection_enabled = data.dll_injection_enabled ?? false;
    config.onboarding_completed = data.onboarding_completed ?? false;
    return config;
  }
}
