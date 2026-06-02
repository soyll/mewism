"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/utils/tailwind";
import {
  fadeTransition,
  fadeVariants,
} from "@/components/layout/fade-transition";

interface OnboardingStepTransitionProps {
  activeIndex: number;
  children: ReactNode[];
  className?: string;
}

export function OnboardingStepTransition({
  activeIndex,
  children,
  className,
}: OnboardingStepTransitionProps) {
  return (
    <div
      className={cn(
        "grid w-full [&>*]:col-start-1 [&>*]:row-start-1",
        className
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          animate="center"
          className="w-full [will-change:opacity]"
          exit="exit"
          initial="enter"
          key={activeIndex}
          transition={fadeTransition}
          variants={fadeVariants}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
