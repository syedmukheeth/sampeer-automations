/**
 * Shared motion language — one easing curve + duration scale across the app
 * so cards, tabs, and buttons feel like one system (no per-component drift).
 */
import type { Transition, Variants } from "framer-motion";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const DUR = {
  fast: 0.18,
  base: 0.32,
  slow: 0.45,
} as const;

/** Standard enter transition for cards/sections. */
export const enterTransition: Transition = { duration: DUR.base, ease: EASE };

/** Fade + lift used by stat/automation cards. `i` staggers a grid. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, delay: i * 0.035, ease: EASE },
  }),
};

/** Tap feedback for buttons. */
export const tap = { scale: 0.98 };
