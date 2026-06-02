export function parseRequirement(
  reqString: string
): [string, string, string] | null {
  if (!reqString || typeof reqString !== "string") {
    return null;
  }

  const pattern = /^([a-zA-Z0-9_-]+)\s*(>=|<=|>|<|==|!=)?\s*([0-9.]+)?$/;
  const match = reqString.trim().match(pattern);
  if (!match) {
    return null;
  }

  return [match[1], match[2] ?? "", match[3] ?? ""];
}

export function compareVersions(version1: string, version2: string): number {
  if (!version1 || !version2) {
    return 0;
  }

  try {
    const parts1 = version1.split(".").map(Number);
    const parts2 = version2.split(".").map(Number);
    const maxLen = Math.max(parts1.length, parts2.length);

    while (parts1.length < maxLen) {
      parts1.push(0);
    }
    while (parts2.length < maxLen) {
      parts2.push(0);
    }

    for (let i = 0; i < maxLen; i++) {
      if (parts1[i] < parts2[i]) {
        return -1;
      }
      if (parts1[i] > parts2[i]) {
        return 1;
      }
    }
    return 0;
  } catch {
    return 0;
  }
}

export function checkRequirement(
  modVersion: string,
  operator: string,
  requiredVersion: string
): boolean {
  if (!operator || !requiredVersion) {
    return true;
  }
  if (!modVersion) {
    return false;
  }

  const cmp = compareVersions(modVersion, requiredVersion);
  switch (operator) {
    case ">=":
      return cmp >= 0;
    case "<=":
      return cmp <= 0;
    case ">":
      return cmp > 0;
    case "<":
      return cmp < 0;
    case "==":
      return cmp === 0;
    case "!=":
      return cmp !== 0;
    default:
      return true;
  }
}
