import { os } from "@orpc/server";
import { z } from "zod";
import { Config } from "@/main/models/config";
import { getServices } from "@/main/bootstrap";
import { autoDetectGameInstall } from "@/main/utils/game-detector";
import { validateGameInstallDir } from "@/main/utils/game-path-validator";

const configSchema = z.object({
  game_install_dir: z.string(),
  mod_folder: z.string(),
  language: z.string(),
  theme: z.string(),
  custom_launch_options: z.string(),
  dev_mode_enabled: z.boolean(),
  debug_console_enabled: z.boolean(),
  close_on_launch: z.boolean(),
  dll_injection_enabled: z.boolean(),
  onboarding_completed: z.boolean(),
});

function configToDto(config: Config) {
  return config.toDict();
}

export const load = os.handler(() => {
  const config = getServices().getConfig();
  return configToDto(config);
});

export const save = os.input(configSchema).handler(({ input }) => {
  const config = Config.fromDict(input);
  getServices().saveConfig(config);
  return configToDto(getServices().getConfig());
});

export const validate = os.handler(() => {
  const config = getServices().getConfig();
  return {
    valid: getServices().configService.validateConfig(config),
    config: configToDto(config),
  };
});

export const detectGamePath = os.handler(() => autoDetectGameInstall());

export const validateGamePath = os
  .input(z.object({ path: z.string() }))
  .handler(({ input }) => {
    const result = validateGameInstallDir(input.path);
    return {
      valid: result.valid,
      executablePath: result.executablePath,
    };
  });

export const getConfigPath = os.handler(() => getServices().configPath);
