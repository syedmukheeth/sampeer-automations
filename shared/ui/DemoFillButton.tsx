"use client";

import { Sparkles, Eraser } from "lucide-react";

/**
 * "Load demo data" control for form-based automations (pipelines + calculators
 * + generators). `onLoad` fills the form with a realistic example so you can
 * walk a client through a live demo; `onClear` empties it back to a clean form.
 *
 * Unlike DemoDataButton (which seeds the kv stores), this just sets local form
 * state. No network, instant.
 */
export function DemoFillButton({
  onLoad,
  onClear,
  className = "",
}: {
  onLoad: () => void;
  onClear?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={onLoad}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand transition hover:border-brand-500"
      >
        <Sparkles className="h-4 w-4" />
        Load demo data
      </button>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          title="Clear the form"
          aria-label="Clear the form"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold text-muted transition hover:border-danger hover:text-danger"
        >
          <Eraser className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}
