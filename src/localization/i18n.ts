import i18n from "i18next";
import { initReactI18next } from "react-i18next";

function flattenKeys(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "_metadata") {
      continue;
    }
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenKeys(value as Record<string, unknown>, fullKey)
      );
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

const localeModules = import.meta.glob("./locales/*.json", {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>;

const resources: Record<string, { translation: Record<string, unknown> }> =
  {};

for (const [path, mod] of Object.entries(localeModules)) {
  const fileName = path.split("/").pop()?.replace(".json", "") ?? "English";
  const code =
    fileName === "English"
      ? "en"
      : fileName === "Português"
        ? "pt"
        : fileName.toLowerCase().slice(0, 2);
  resources[code] = { translation: flattenKeys(mod.default) };
}

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: "en",
  resources,
  interpolation: { escapeValue: false },
});

export default i18n;
