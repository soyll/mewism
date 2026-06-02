export type ModDto = {
  name: string;
  path: string;
  enabled: boolean;
  missing: boolean;
  metadata: Record<string, unknown>;
  preview_path: string | null;
  has_unmet_requirements: boolean;
  has_dlls: boolean;
  title: string;
  author: string;
  version: string;
  description: string;
  url: string;
};

export type ConfigDto = {
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

export type ModListDto = {
  enabled: ModDto[];
  disabled: ModDto[];
  errors: string[];
};

export type LaunchCheckResult = {
  canLaunch: boolean;
  missingMods: string[];
  requirementErrors: string[];
  protonWarning: boolean;
  dllWarning: string | null;
};

export type InstallResultDto = {
  modName: string;
  replaced: boolean;
};

export type ModViewMode = "list" | "grid";
