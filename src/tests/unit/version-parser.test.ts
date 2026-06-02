import { describe, expect, it } from "vitest";
import {
  checkRequirement,
  compareVersions,
  parseRequirement,
} from "@/main/utils/version-parser";

describe("version-parser", () => {
  it("parses mod name only", () => {
    expect(parseRequirement("CoreMod")).toEqual(["CoreMod", "", ""]);
  });

  it("parses version constraint", () => {
    expect(parseRequirement("CoreMod>=1.0.0")).toEqual([
      "CoreMod",
      ">=",
      "1.0.0",
    ]);
  });

  it("compares versions", () => {
    expect(compareVersions("1.0.0", "1.2.0")).toBe(-1);
    expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
  });

  it("checks requirements", () => {
    expect(checkRequirement("1.5.0", ">=", "1.0.0")).toBe(true);
    expect(checkRequirement("0.9.0", ">=", "1.0.0")).toBe(false);
    expect(checkRequirement("", ">=", "1.0.0")).toBe(false);
  });
});
