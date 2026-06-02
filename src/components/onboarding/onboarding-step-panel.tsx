"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/tailwind";

export function OnboardingStepPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {children}
    </div>
  );
}
