"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eraser, Loader2 } from "lucide-react";
import type { DemoResource } from "@shared/services/demo-data";

/**
 * Demo data control. Pass a `resource` to scope it to a single automation
 * (its own Load + Clear); omit it for the dashboard-wide control that seeds
 * every automation at once. Refreshes the route so changes appear immediately.
 */
export function DemoDataButton({
  resource,
  variant = "full",
}: {
  resource?: DemoResource;
  variant?: "full" | "compact";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "seed" | "clear">(null);

  async function run(action: "seed" | "clear") {
    setBusy(action);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resource }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const loadLabel = variant === "full" && !resource ? "Load all demo data" : "Load demo data";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => run("seed")}
        disabled={busy !== null}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand transition hover:border-brand-500 disabled:opacity-50"
      >
        {busy === "seed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loadLabel}
      </button>
      <button
        type="button"
        onClick={() => run("clear")}
        disabled={busy !== null}
        aria-label="Clear demo data"
        title="Remove demo data"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
      >
        {busy === "clear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
        {variant === "compact" ? "" : "Clear"}
      </button>
    </div>
  );
}
