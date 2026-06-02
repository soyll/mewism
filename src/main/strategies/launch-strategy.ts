import { spawn } from "node:child_process";
import { PathStrategyFactory, ProtonPathStrategy } from "./path-strategy";
import { detectSteamAppId } from "../utils/game-detector";

export interface LaunchStrategy {
  launch(
    executablePath: string,
    modPaths: string[],
    gameDir: string,
    extraArgs?: string[]
  ): void;
  getLaunchOptions(modPaths: string[], extraArgs?: string[]): string;
}

class DirectLaunchStrategy implements LaunchStrategy {
  launch(
    executablePath: string,
    modPaths: string[],
    gameDir: string,
    extraArgs: string[] = []
  ): void {
    const args = [executablePath, ...extraArgs];
    if (modPaths.length > 0) {
      args.push("-modpaths", ...modPaths);
    }
    spawn(args[0], args.slice(1), { cwd: gameDir, detached: true, stdio: "ignore" });
  }

  getLaunchOptions(modPaths: string[], extraArgs: string[] = []): string {
    const parts = [...extraArgs];
    if (modPaths.length > 0) {
      parts.push("-modpaths", ...modPaths.map((p) => `"${p}"`));
    }
    return parts.join(" ");
  }
}

class ProtonLaunchStrategy implements LaunchStrategy {
  private readonly appId: string;

  constructor(private readonly gameDir: string) {
    this.appId = detectSteamAppId(gameDir);
  }

  launch(
    executablePath: string,
    modPaths: string[],
    gameDir: string,
    extraArgs: string[] = []
  ): void {
    if (process.platform === "linux") {
      this.launchViaSteam(modPaths, extraArgs);
    } else {
      new DirectLaunchStrategy().launch(
        executablePath,
        modPaths,
        gameDir,
        extraArgs
      );
    }
  }

  private launchViaSteam(modPaths: string[], extraArgs: string[]): void {
    if (!this.appId) {
      throw new Error(
        "Could not detect Steam App ID. Please ensure the game is installed through Steam."
      );
    }

    const launchOptions = [...extraArgs];
    if (modPaths.length > 0) {
      launchOptions.push("-modpaths", ...modPaths);
    }

    try {
      const cmd = ["steam", "-applaunch", this.appId, ...launchOptions];
      spawn(cmd[0], cmd.slice(1), { detached: true, stdio: "ignore" });
    } catch {
      spawn("xdg-open", [`steam://rungameid/${this.appId}`], {
        detached: true,
        stdio: "ignore",
      });
    }
  }

  getLaunchOptions(modPaths: string[], extraArgs: string[] = []): string {
    return new DirectLaunchStrategy().getLaunchOptions(modPaths, extraArgs);
  }
}

export class LaunchStrategyFactory {
  static create(gameDir: string): LaunchStrategy {
    if (PathStrategyFactory.isProton(gameDir)) {
      return new ProtonLaunchStrategy(gameDir);
    }
    return new DirectLaunchStrategy();
  }
}

export { ProtonPathStrategy };
