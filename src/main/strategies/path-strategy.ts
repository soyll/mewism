import { existsSync } from "node:fs";
import { join, sep } from "node:path";

export interface PathStrategy {
  convertModPaths(paths: string[], gameDir: string): string[];
  shouldWarnAboutExternalMods(modPaths: string[], gameDir: string): boolean;
}

class NativePathStrategy implements PathStrategy {
  convertModPaths(paths: string[]): string[] {
    return paths;
  }

  shouldWarnAboutExternalMods(): boolean {
    return false;
  }
}

export class ProtonPathStrategy implements PathStrategy {
  convertModPaths(paths: string[]): string[] {
    return paths.map((p) => ProtonPathStrategy.convertToProtonPath(p));
  }

  shouldWarnAboutExternalMods(modPaths: string[], gameDir: string): boolean {
    return modPaths.some((p) => !p.startsWith(gameDir));
  }

  static convertToProtonPath(path: string): string {
    return `Z:${path.replaceAll(sep, "/")}`;
  }
}

export class PathStrategyFactory {
  static create(gameDir: string): PathStrategy {
    if (process.platform === "win32") {
      return new NativePathStrategy();
    }
    const protonExe = join(gameDir, "Mewgenics.exe");
    if (existsSync(protonExe)) {
      return new ProtonPathStrategy();
    }
    return new NativePathStrategy();
  }

  static isProton(gameDir: string): boolean {
    return PathStrategyFactory.create(gameDir) instanceof ProtonPathStrategy;
  }
}
