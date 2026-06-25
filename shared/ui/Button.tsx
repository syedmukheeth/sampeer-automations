"use client";

import { motion } from "framer-motion";
import { cn } from "@shared/lib/cn";
import { tap } from "@shared/lib/motion";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-soft hover:bg-brand-700 focus-visible:ring-brand-500 disabled:opacity-50",
  secondary:
    "border border-line bg-panel text-ink hover:border-brand-500 hover:bg-brand-50 focus-visible:ring-brand-500",
  ghost:
    "text-muted hover:bg-stone-100 hover:text-ink focus-visible:ring-brand-500",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={tap}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed",
        VARIANTS[variant],
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
