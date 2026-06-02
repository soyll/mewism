import { describe, expect, it } from "vitest";
import { ProtonPathStrategy } from "@/main/strategies/path-strategy";

describe("Proton path conversion", () => {
  it("converts paths to Z: prefix", () => {
    const proton = new ProtonPathStrategy();
    const result = proton.convertModPaths(["/home/user/mods/Foo"], "/game");
    expect(result[0]).toBe("Z:/home/user/mods/Foo");
  });
});
