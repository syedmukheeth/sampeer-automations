"use client";

import { useState } from "react";
import { cn } from "@shared/lib/cn";

const LOGO_SRC = "/SampeerStudio-Logo.png";

/**
 * Sampeer Studio brand mark. If the raster asset is unavailable, fall back to
 * a styled letter mark so the UI never shows a broken image.
 */
export function BrandLogo({
  className,
  alt = "Sampeer Studio",
}: {
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={cn(
          "flex items-center justify-center bg-brand-gradient text-sm font-bold text-white shadow-glow",
          className,
        )}
      >
        S
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}
