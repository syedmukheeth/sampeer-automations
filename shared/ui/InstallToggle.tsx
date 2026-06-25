"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@shared/lib/cn";

export function InstallToggle({
  slug,
  installed: initial,
  size = "sm",
}: {
  slug: string;
  installed: boolean;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const [installed, setInstalled] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !installed;
    setBusy(true);
    try {
      const res = await fetch("/api/installs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, enabled: next }),
      });
      if (!res.ok) throw new Error("failed");
      setInstalled(next);
      startTransition(() => router.refresh());
    } catch {
    } finally {
      setBusy(false);
    }
  }

  const working = busy || pending;
  const lg = size === "lg";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={working}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition duration-200 disabled:opacity-60",
        lg ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs",
        installed
          ? "border border-line bg-panel text-muted hover:border-danger/40 hover:text-danger"
          : "bg-brand text-white shadow-soft hover:bg-brand-700",
      )}
    >
      {working ? (
        <Loader2 className={cn(lg ? "h-4 w-4" : "h-3.5 w-3.5", "animate-spin")} />
      ) : installed ? (
        <Check className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} />
      ) : (
        <Plus className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} />
      )}
      {installed ? "Installed" : "Install"}
    </button>
  );
}
