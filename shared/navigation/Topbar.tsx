"use client";

import { LogOut } from "lucide-react";
import { CommandPalette } from "./CommandPalette";

export function Topbar() {
  return (
    <header className="z-10 hidden h-[4.5rem] shrink-0 items-center gap-4 border-b border-line/80 bg-canvas/88 px-6 backdrop-blur-xl lg:flex">
      <div className="flex flex-1 items-center gap-3">
        <CommandPalette />
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
