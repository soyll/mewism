"use client";

import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Transition,
  type Variant,
} from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/utils/tailwind";

export type TransitionPanelProps = {
  children: ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence
        custom={motionProps.custom}
        initial={false}
        mode="popLayout"
      >
        <motion.div
          animate="center"
          exit="exit"
          initial="enter"
          key={activeIndex}
          transition={transition}
          variants={variants}
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
