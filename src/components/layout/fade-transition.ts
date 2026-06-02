import type { Transition, Variant } from "motion/react";

/** Fast crossfade — old and new content overlap instead of waiting in sequence. */
export const fadeTransition: Transition = {
  duration: 0.12,
  ease: [0.4, 0, 0.2, 1],
};

export const fadeVariants: {
  enter: Variant;
  center: Variant;
  exit: Variant;
} = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0, pointerEvents: "none" },
};

/** Container that stacks animated layers in the same grid cell for crossfade. */
export const fadeContainerClassName =
  "grid h-full min-h-0 [&>*]:col-start-1 [&>*]:row-start-1";

/** Animated layer — scroll lives here so crossfading pages don't fight layout. */
export const fadeLayerClassName =
  "min-h-0 overflow-auto [will-change:opacity]";
