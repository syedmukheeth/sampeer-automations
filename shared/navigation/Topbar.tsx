"use client";

import { LogOut, ShieldCheck, Eye } from "lucide-react";
import type { Role } from "@shared/services/auth";
import { CommandPalette } from "./CommandPalette";

export function Topbar({ username, role }: { username: string; role: Role }) {
  const isOwner = role === "owner";
  return (
    <header className="z-10 hidden h-[4.5rem] shrink-0 items-center gap-4 border-b border-line/80 bg-canvas/88 px-6 backdrop-blur-xl lg:flex">
      <div className="flex flex-1 items-center gap-3">
        <CommandPalette />
      </div>
      <div
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-soft ${
          isOwner
            ? "border-brand-200 bg-brand-50 text-brand"
            : "border-amber-200 bg-amber-50 text-amber-700"
        }`}
        title={isOwner ? "Founder — full access" : "Admin — limited view, money & settings hidden"}
      >
        {isOwner ? <ShieldCheck className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span>{username || (isOwner ? "Founder" : "Admin")}</span>
        <span className="text-[11px] font-medium opacity-70">
          {isOwner ? "Owner" : "Admin · limited"}
        </span>
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
