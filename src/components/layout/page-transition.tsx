"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  fadeContainerClassName,
  fadeLayerClassName,
  fadeTransition,
  fadeVariants,
} from "./fade-transition";
import { cn } from "@/utils/tailwind";

export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className={cn(fadeContainerClassName, className)}>
      <AnimatePresence initial={false}>
        <motion.div
          animate="center"
          className={cn(
            fadeLayerClassName,
            "flex flex-col overflow-hidden"
          )}
          exit="exit"
          initial="enter"
          key={pathname}
          transition={fadeTransition}
          variants={fadeVariants}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
