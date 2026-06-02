import path from "node:path";
import { app } from "electron";

function getAssetsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, "assets")
    : path.join(app.getAppPath(), "assets");
}

export function getAppIconPath(): string | undefined {
  const assetsDir = getAssetsDir();
  if (process.platform === "win32") {
    return path.join(assetsDir, "icon.ico");
  }
  if (process.platform === "linux" || process.platform === "darwin") {
    return path.join(assetsDir, "icon.png");
  }
  return undefined;
}
