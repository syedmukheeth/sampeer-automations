"use client";

import { LogOut, Search } from "lucide-react";

/** Slim top bar: search affordance + owner sign-out. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-line bg-canvas/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center gap-2 text-muted">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 text-sm text-muted">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search automations…</span>
        </div>
      </div>
      <a
        href="/api/auth/logout"
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 text-sm font-medium text-muted transition hover:border-slate-300 hover:text-ink"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </a>
    </header>
  );
}
