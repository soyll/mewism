"use client";

import type { CSSProperties, ElementType } from "react";
import { useTranslation } from "react-i18next";
import { TextMorph } from "torph/react";
import { cn } from "@/utils/tailwind";

const BLOCK_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "div"]);

type MorphTextProps = {
  children: string;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
};

export function MorphText({ children, className, as, style }: MorphTextProps) {
  const { i18n } = useTranslation();
  const Tag = as ?? "span";
  const isBlock =
    typeof Tag === "string" && BLOCK_TAGS.has(Tag.toLowerCase());

  return (
    <TextMorph
      as={Tag}
      className={cn(isBlock && "block w-full min-w-0", className)}
      locale={i18n.language}
      style={style}
    >
      {children}
    </TextMorph>
  );
}
