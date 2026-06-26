"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { EASE } from "@shared/lib/motion";

/**
 * Cross-route page transition. Re-keys on the pathname so each navigation fades
 * the NEW page in. We intentionally do NOT use AnimatePresence `mode="wait"`
 * here: in the App Router the children swap synchronously on navigation, so the
 * exit-then-enter wait left the incoming page blank until a manual refresh.
 * Animating only the entrance is reliable and keeps the same motion language.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
