import { ipc } from "@/ipc/manager";

export const configActions = {
  load: () => ipc.client.config.load(),
  save: (config: Parameters<typeof ipc.client.config.save>[0]) =>
    ipc.client.config.save(config),
  validate: () => ipc.client.config.validate(),
  detectGamePath: () => ipc.client.config.detectGamePath(),
  validateGamePath: (path: string) =>
    ipc.client.config.validateGamePath({ path }),
};

export const modsActions = {
  list: () => ipc.client.mods.list(),
  checkChanges: () => ipc.client.mods.checkChanges(),
  enable: (name: string) => ipc.client.mods.enable({ name }),
  disable: (name: string) => ipc.client.mods.disable({ name }),
  enableAll: () => ipc.client.mods.enableAll(),
  disableAll: () => ipc.client.mods.disableAll(),
  reorder: (enabledNames: string[]) =>
    ipc.client.mods.reorder({ enabledNames }),
  moveUp: (name: string) => ipc.client.mods.moveUp({ name }),
  moveDown: (name: string) => ipc.client.mods.moveDown({ name }),
  moveToTop: (name: string) => ipc.client.mods.moveToTop({ name }),
  moveToBottom: (name: string) => ipc.client.mods.moveToBottom({ name }),
  autoSort: () => ipc.client.mods.autoSort(),
  getPreviewDataUrl: (previewPath: string | null) =>
    ipc.client.mods.getPreviewDataUrl({ previewPath }),
  install: (sourcePath: string, type: "zip" | "folder", replace?: boolean) =>
    ipc.client.mods.install({ sourcePath, type, replace }),
  installFromDrop: (paths: string[], replace?: boolean) =>
    ipc.client.mods.installFromDrop({ paths, replace }),
};

export const launcherActions = {
  preflight: () => ipc.client.launcher.preflight(),
  launch: (opts?: {
    skipRequirementWarnings?: boolean;
    skipProtonWarning?: boolean;
  }) => ipc.client.launcher.launch(opts ?? {}),
  getLaunchOptions: () => ipc.client.launcher.getLaunchOptions(),
  exportBat: (outputPath: string) =>
    ipc.client.launcher.exportBat({ outputPath }),
};

export const fsActions = {
  openFolder: (path: string) => ipc.client.fs.openFolder({ path }),
  pickFolder: (title?: string) => ipc.client.fs.pickFolder({ title }),
  pickFile: (
    opts?: Parameters<typeof ipc.client.fs.pickFile>[0]
  ) => ipc.client.fs.pickFile(opts),
  pickSaveFile: (
    opts?: Parameters<typeof ipc.client.fs.pickSaveFile>[0]
  ) => ipc.client.fs.pickSaveFile(opts),
  pickInstallMod: () => ipc.client.fs.pickInstallMod(),
  openExternal: (url: string) => ipc.client.fs.openExternal({ url }),
};

export const modlistActions = {
  importJson: (filepath: string) =>
    ipc.client.modlist.importJson({ filepath }),
  exportJson: (filepath: string, name?: string) =>
    ipc.client.modlist.exportJson({ filepath, name }),
  importText: (filepath: string) =>
    ipc.client.modlist.importText({ filepath }),
  exportText: (filepath: string) =>
    ipc.client.modlist.exportText({ filepath }),
};

export const dllActions = {
  cleanup: () => ipc.client.dll.cleanup(),
  getStatus: () => ipc.client.dll.getStatus(),
};

export const packActions = {
  unpack: () => ipc.client.pack.unpack(),
  repack: () => ipc.client.pack.repack(),
  getProgress: () => ipc.client.pack.getProgress(),
};
