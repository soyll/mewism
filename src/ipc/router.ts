import { app } from "./app";
import { config } from "./config";
import { dll } from "./dll";
import { fs } from "./fs";
import { launcher } from "./launcher";
import { modlist } from "./modlist";
import { mods } from "./mods";
import { pack } from "./pack";
import { theme } from "./theme";
import { window } from "./window";

export const router = {
  theme,
  window,
  app,
  config,
  mods,
  launcher,
  modlist,
  dll,
  pack,
  fs,
};
