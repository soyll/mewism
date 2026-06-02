import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import log from "electron-log";

let initialized = false;

export function initLogging(logsDir: string): void {
  if (initialized) {
    return;
  }
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }
  log.transports.file.resolvePathFn = () => join(logsDir, "mewism.log");
  log.transports.file.maxSize = 5 * 1024 * 1024;
  initialized = true;
}

export function getLogger() {
  return log;
}
