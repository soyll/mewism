import { spawn } from "node:child_process";
import { normalize } from "node:path";

export interface PlatformStrategy {
  openPath(path: string): void;
  getExecutableNames(): string[];
  normalizePath(path: string): string;
}

class WindowsPlatform implements PlatformStrategy {
  openPath(path: string): void {
    spawn("cmd", ["/c", "start", "", path], { detached: true, stdio: "ignore" });
  }

  getExecutableNames(): string[] {
    return ["Mewgenics.exe"];
  }

  normalizePath(path: string): string {
    return normalize(path);
  }
}

class LinuxPlatform implements PlatformStrategy {
  openPath(path: string): void {
    spawn("xdg-open", [path], { detached: true, stdio: "ignore" });
  }

  getExecutableNames(): string[] {
    return [
      "Mewgenics.exe",
      "Mewgenics",
      "Mewgenics.x86_64",
      "Mewgenics.x86",
    ];
  }

  normalizePath(path: string): string {
    return normalize(path);
  }
}

class MacPlatform implements PlatformStrategy {
  openPath(path: string): void {
    spawn("open", [path], { detached: true, stdio: "ignore" });
  }

  getExecutableNames(): string[] {
    return ["Mewgenics", "Mewgenics.app"];
  }

  normalizePath(path: string): string {
    return normalize(path);
  }
}

export class PlatformFactory {
  static create(): PlatformStrategy {
    if (process.platform === "win32") {
      return new WindowsPlatform();
    }
    if (process.platform === "darwin") {
      return new MacPlatform();
    }
    return new LinuxPlatform();
  }
}
