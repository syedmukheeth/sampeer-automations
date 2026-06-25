"use client";

import { LogOut, Search, Command } from "lucide-react";

export function Topbar() {
  return (
    <header className="z-10 hidden h-[4.5rem] shrink-0 items-center gap-4 border-b border-line/80 bg-canvas/88 px-6 backdrop-blur-xl lg:flex">
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-line bg-panel/80 px-3 text-sm text-muted shadow-soft">
          <Search className="h-4 w-4" />
          <span className="hidden flex-1 sm:inline">Search automations</span>
          <span className="hidden items-center gap-1 rounded-md border border-line bg-stone-50 px-1.5 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
            <Command className="h-3 w-3" /> K
          </span>
        </div>
      </div>
      <a
        href="/api/auth/logout"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-3 text-sm font-semibold text-muted shadow-soft transition duration-200 hover:border-brand-500 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </a>
    </header>
  );
}
