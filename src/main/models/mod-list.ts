import { Mod } from "./mod";

export class ModList {
  private _mods: Mod[];

  constructor(mods: Mod[] = []) {
    this._mods = mods;
  }

  get allMods(): Mod[] {
    return [...this._mods];
  }

  get enabledMods(): Mod[] {
    return this._mods.filter((m) => m.enabled && !m.missing);
  }

  get disabledMods(): Mod[] {
    return this._mods.filter((m) => !m.enabled);
  }

  get missingMods(): Mod[] {
    return this._mods.filter((m) => m.enabled && m.missing);
  }

  get enabledModNames(): string[] {
    return this._mods.filter((m) => m.enabled).map((m) => m.name);
  }

  getModByName(name: string): Mod | undefined {
    return this._mods.find((m) => m.name === name);
  }

  enableMod(modName: string): void {
    const mod = this.getModByName(modName);
    if (mod && !mod.enabled) {
      mod.enabled = true;
    }
  }

  disableMod(modName: string): void {
    const mod = this.getModByName(modName);
    if (mod?.enabled) {
      mod.enabled = false;
    }
  }

  enableAll(): void {
    for (const mod of this._mods) {
      if (!mod.missing) {
        mod.enabled = true;
      }
    }
  }

  disableAll(): void {
    for (const mod of this._mods) {
      mod.enabled = false;
    }
  }

  moveUp(modName: string): void {
    const enabled = this._mods.filter((m) => m.enabled);
    const index = enabled.findIndex((m) => m.name === modName);
    if (index <= 0) {
      return;
    }
    const allMods = [...this._mods];
    const oldIdx = allMods.indexOf(enabled[index]);
    const targetIdx = allMods.indexOf(enabled[index - 1]);
    [allMods[oldIdx], allMods[targetIdx]] = [
      allMods[targetIdx],
      allMods[oldIdx],
    ];
    this._mods = allMods;
  }

  moveDown(modName: string): void {
    const enabled = this._mods.filter((m) => m.enabled);
    const index = enabled.findIndex((m) => m.name === modName);
    if (index < 0 || index >= enabled.length - 1) {
      return;
    }
    const allMods = [...this._mods];
    const oldIdx = allMods.indexOf(enabled[index]);
    const targetIdx = allMods.indexOf(enabled[index + 1]);
    [allMods[oldIdx], allMods[targetIdx]] = [
      allMods[targetIdx],
      allMods[oldIdx],
    ];
    this._mods = allMods;
  }

  moveToTop(modName: string): void {
    const mod = this.getModByName(modName);
    if (!mod?.enabled) {
      return;
    }
    this._mods = this._mods.filter((m) => m !== mod);
    const firstEnabledIdx = this._mods.findIndex((m) => m.enabled);
    this._mods.splice(
      firstEnabledIdx >= 0 ? firstEnabledIdx : this._mods.length,
      0,
      mod
    );
  }

  moveToBottom(modName: string): void {
    const mod = this.getModByName(modName);
    if (!mod?.enabled) {
      return;
    }
    this._mods = this._mods.filter((m) => m !== mod);
    let lastEnabledIdx = -1;
    for (let i = this._mods.length - 1; i >= 0; i--) {
      if (this._mods[i].enabled) {
        lastEnabledIdx = i;
        break;
      }
    }
    this._mods.splice(lastEnabledIdx + 1, 0, mod);
  }

  setOrder(enabledNames: string[]): void {
    const enabledMap = new Map(
      this._mods.filter((m) => m.enabled).map((m) => [m.name, m])
    );
    const disabledMods = this._mods.filter((m) => !m.enabled);
    const newEnabled: Mod[] = [];

    for (const name of enabledNames) {
      const mod = enabledMap.get(name);
      if (mod) {
        newEnabled.push(mod);
      }
    }

    for (const mod of enabledMap.values()) {
      if (!newEnabled.includes(mod)) {
        newEnabled.push(mod);
      }
    }

    this._mods = [...newEnabled, ...disabledMods];
  }

  replaceMods(mods: Mod[]): void {
    this._mods = mods;
  }

  toDict() {
    return this._mods.map((m) => m.toDict());
  }
}
