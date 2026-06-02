"use client";

import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { configActions } from "@/actions/mods";
import { setTheme } from "@/actions/theme";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { fadeTransition, fadeVariants } from "@/components/layout/fade-transition";
import { OnboardingStepPanel } from "@/components/onboarding/onboarding-step-panel";
import { OnboardingStepTransition } from "@/components/onboarding/onboarding-step-transition";
import { GamePathField } from "@/components/shared/game-path-field";
import { LanguageFlag } from "@/components/shared/language-flag";
import { MorphText } from "@/components/ui/morph-text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSystemPrefersDark } from "@/hooks/use-system-prefers-dark";
import {
  languageNameToI18nCode,
  ONBOARDING_LANGUAGES,
  type OnboardingLanguage,
} from "@/localization/onboarding-languages";
import { cn } from "@/utils/tailwind";
import { getOrderedThemeOptions } from "@/utils/theme-options";
import type { ConfigDto } from "@/types/mods";
import type { ThemeMode } from "@/types/theme-mode";

type Step = "intro" | "setup";

const STEPS: Step[] = ["intro", "setup"];

const STEP_COPY: Record<
  Step,
  { titleKey: string; descriptionKey: string }
> = {
  intro: {
    titleKey: "onboarding.intro_title",
    descriptionKey: "onboarding.intro_description",
  },
  setup: {
    titleKey: "onboarding.setup_title",
    descriptionKey: "onboarding.setup_description",
  },
};

function LanguageOption({ language }: { language: OnboardingLanguage }) {
  return <LanguageFlag language={language} />;
}

export function OnboardingWizard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("intro");
  const [config, setConfig] = useState<ConfigDto | null>(null);
  const [language, setLanguage] = useState<OnboardingLanguage>("English");
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [gamePath, setGamePath] = useState("");
  const [gamePathValid, setGamePathValid] = useState(false);
  const [saving, setSaving] = useState(false);
  const systemPrefersDark = useSystemPrefersDark();
  const themeOptions = useMemo(
    () => getOrderedThemeOptions(systemPrefersDark),
    [systemPrefersDark]
  );

  useEffect(() => {
    configActions.load().then((loaded) => {
      setConfig(loaded);
      if (loaded.onboarding_completed) {
        navigate({ to: "/" });
        return;
      }
      if (
        ONBOARDING_LANGUAGES.includes(loaded.language as OnboardingLanguage)
      ) {
        setLanguage(loaded.language as OnboardingLanguage);
      }
      setThemeState("system");
      setTheme("system").catch(() => undefined);
      if (loaded.game_install_dir) {
        setGamePath(loaded.game_install_dir);
        configActions
          .validateGamePath(loaded.game_install_dir)
          .then((r) => setGamePathValid(r.valid));
      }
    });
  }, [navigate]);

  const applyLanguage = async (langName: OnboardingLanguage) => {
    setLanguage(langName);
    const code = languageNameToI18nCode(langName);
    await i18n.changeLanguage(code);
    document.documentElement.lang = code;
  };

  const applyTheme = (value: ThemeMode) => {
    setThemeState(value);
    setTheme(value).catch(() => undefined);
  };

  const finish = async () => {
    if (!config) {
      return;
    }
    if (!gamePath) {
      return;
    }
    setSaving(true);
    try {
      await configActions.save({
        ...config,
        language,
        theme,
        game_install_dir: gamePath,
        onboarding_completed: true,
      });
      await applyLanguage(language);
      await setTheme(theme);
      navigate({ to: "/" });
    } finally {
      setSaving(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const selectedTheme = themeOptions.find((option) => option.value === theme);
  const canFinish = Boolean(gamePath && gamePathValid);
  const { titleKey: stepTitleKey, descriptionKey: stepDescriptionKey } =
    STEP_COPY[step];

  if (!config) {
    return (
      <div className="flex h-full items-center justify-center">
        <MorphText>{t("window.checking")}</MorphText>
      </div>
    );
  }

  const introPanel = (
    <OnboardingStepPanel className="text-center">
      <Button
        className="w-full sm:w-auto"
        hoverScale={1.05}
        onClick={() => setStep("setup")}
        size="lg"
      >
        {t("onboarding.intro_continue")}
      </Button>
    </OnboardingStepPanel>
  );

  const setupPanel = (
    <OnboardingStepPanel>
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <span className="font-medium text-sm">
            {t("onboarding.language_label")}
          </span>
          <Select
            onValueChange={(value) =>
              applyLanguage(value as OnboardingLanguage)
            }
            value={language}
          >
            <SelectTrigger className="w-full">
              <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <LanguageOption language={language} />
                <SelectValue placeholder={t("onboarding.language_label")} />
              </span>
            </SelectTrigger>
            <SelectContent>
              {ONBOARDING_LANGUAGES.map((lang) => (
                <SelectItem
                  key={lang}
                  leading={<LanguageOption language={lang} />}
                  textValue={lang}
                  value={lang}
                >
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="font-medium text-sm">
            {t("onboarding.theme_label")}
          </span>
          <Select
            onValueChange={(value) => applyTheme(value as ThemeMode)}
            value={theme}
          >
            <SelectTrigger className="w-full">
              <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                {selectedTheme && (
                  <selectedTheme.icon className="size-4 shrink-0" />
                )}
                <SelectValue placeholder={t("onboarding.theme_label")} />
              </span>
            </SelectTrigger>
            <SelectContent>
              {themeOptions.map(({ value, icon: Icon, labelKey }) => (
                <SelectItem
                  key={value}
                  leading={<Icon className="size-4 shrink-0" />}
                  textValue={t(labelKey)}
                  value={value}
                >
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="font-medium text-sm">
            {t("onboarding.game_path_label")}
          </span>
          <GamePathField
            onChange={setGamePath}
            onValidityChange={setGamePathValid}
            value={gamePath}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            onClick={() => setStep("intro")}
            variant="outline"
          >
            {t("onboarding.back")}
          </Button>
          <Button
            className="flex-1"
            disabled={!canFinish || saving}
            hoverScale={1.05}
            onClick={finish}
          >
            {t("onboarding.get_started")}
          </Button>
        </div>
      </div>
    </OnboardingStepPanel>
  );

  return (
    <motion.div
      animate="center"
      className="flex h-full min-h-0 w-full flex-col overflow-y-auto overflow-x-hidden"
      initial="enter"
      transition={fadeTransition}
      variants={fadeVariants}
    >
      <header className="flex shrink-0 flex-col items-center px-6 pt-[clamp(3rem,18vh,9rem)] pb-6">
        <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i <= stepIndex ? "bg-primary" : "bg-muted"
                )}
                key={s}
              />
            ))}
          </div>

          <div className="flex w-full flex-col items-center gap-3 text-center">
            <MorphText
              as="h1"
              className="text-balance font-bold text-2xl tracking-tight"
            >
              {t(stepTitleKey)}
            </MorphText>
            <MorphText
              as="p"
              className="text-pretty text-muted-foreground text-sm leading-relaxed"
            >
              {t(stepDescriptionKey)}
            </MorphText>
          </div>
        </div>
      </header>

      <section className="flex w-full shrink-0 flex-col items-center px-6 pb-8">
        <OnboardingStepTransition
          activeIndex={stepIndex}
          className="w-full max-w-lg"
        >
          {[introPanel, setupPanel]}
        </OnboardingStepTransition>
      </section>
    </motion.div>
  );
}
