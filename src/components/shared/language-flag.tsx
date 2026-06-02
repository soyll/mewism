import type { ComponentType } from "react";
import CN from "country-flag-icons/react/3x2/CN";
import DE from "country-flag-icons/react/3x2/DE";
import ES from "country-flag-icons/react/3x2/ES";
import FR from "country-flag-icons/react/3x2/FR";
import IT from "country-flag-icons/react/3x2/IT";
import JP from "country-flag-icons/react/3x2/JP";
import PL from "country-flag-icons/react/3x2/PL";
import PT from "country-flag-icons/react/3x2/PT";
import US from "country-flag-icons/react/3x2/US";
import type { OnboardingLanguage } from "@/localization/onboarding-languages";
import { cn } from "@/utils/tailwind";

const LANGUAGE_FLAG_COMPONENTS = {
  English: US,
  Deutsch: DE,
  Español: ES,
  Français: FR,
  Italiano: IT,
  Português: PT,
  Polish: PL,
  中文: CN,
  日本語: JP,
} satisfies Record<OnboardingLanguage, ComponentType<{ className?: string }>>;

interface LanguageFlagProps {
  language: OnboardingLanguage;
  className?: string;
}

export function LanguageFlag({ language, className }: LanguageFlagProps) {
  const Flag = LANGUAGE_FLAG_COMPONENTS[language];

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-[3px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      <Flag className="block h-3.5 w-[21px]" />
    </span>
  );
}
