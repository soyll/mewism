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

export function AppContentTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className={fadeContainerClassName}>
      <AnimatePresence initial={false}>
        <motion.div
          animate="center"
          className={fadeLayerClassName}
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
