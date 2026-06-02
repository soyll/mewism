export const ONBOARDING_LANGUAGES = [
  "English",
  "Deutsch",
  "Español",
  "Français",
  "Italiano",
  "Português",
  "Polish",
  "中文",
  "日本語",
] as const;

export type OnboardingLanguage = (typeof ONBOARDING_LANGUAGES)[number];

export function languageNameToI18nCode(name: string): string {
  const map: Record<string, string> = {
    English: "en",
    Deutsch: "de",
    Español: "es",
    Français: "fr",
    Italiano: "it",
    Português: "pt",
    Polish: "pl",
    中文: "zh",
    日本語: "ja",
  };
  return map[name] ?? "en";
}

export function i18nCodeToLanguageName(code: string): string {
  const map: Record<string, string> = {
    en: "English",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    pt: "Português",
    pl: "Polish",
    zh: "中文",
    ja: "日本語",
  };
  return map[code] ?? "English";
}
