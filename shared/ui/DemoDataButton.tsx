"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Eraser, Loader2 } from "lucide-react";

/**
 * One-click demo data control. Seeds realistic sample records across the
 * KV automations (CRM, leads, projects, competitors), or clears just the demo
 * rows. Refreshes the current route so seeded data appears immediately.
 *
 * `variant="full"` shows both Load + Clear (for the dashboard);
 * `variant="compact"` shows a single toggle-style Load button (per tool).
 */
export function DemoDataButton({ variant = "full" }: { variant?: "full" | "compact" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "seed" | "clear">(null);

  async function run(action: "seed" | "clear") {
    setBusy(action);
    try {
      await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  const seedBtn = (
    <button
      type="button"
      onClick={() => run("seed")}
      disabled={busy !== null}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand transition hover:border-brand-500 disabled:opacity-50"
    >
      {busy === "seed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Load demo data
    </button>
  );

  if (variant === "compact") return seedBtn;

  return (
    <div className="flex items-center gap-2">
      {seedBtn}
      <button
        type="button"
        onClick={() => run("clear")}
        disabled={busy !== null}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm font-semibold text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
      >
        {busy === "clear" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
        Clear
      </button>
    </div>
  );
}
