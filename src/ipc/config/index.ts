export { detectGamePath, getConfigPath, load, save, validate, validateGamePath } from "./handlers";

import {
  detectGamePath,
  getConfigPath,
  load,
  save,
  validate,
  validateGamePath,
} from "./handlers";

export const config = {
  load,
  save,
  validate,
  detectGamePath,
  validateGamePath,
  getConfigPath,
};
