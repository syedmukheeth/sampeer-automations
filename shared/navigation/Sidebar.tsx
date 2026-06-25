"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Settings, LibraryBig, Sparkles } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { BrandLogo } from "@shared/ui/BrandLogo";
import { operatingSystems } from "@features/registry";

export function Sidebar({ installed = [] }: { installed?: string[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-line bg-sidebar text-slate-300 lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <BrandLogo className="h-9 w-9 rounded-xl" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Sampeer Studio</p>
          <p className="text-[11px] text-slate-500">Get noticed. Remembered. Chosen.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {/* Top level */}
        <div className="space-y-1">
          <NavItem href="/" label="Overview" icon={Home} active={pathname === "/"} />
          <NavItem
            href="/library"
            label="Automation Library"
            icon={LibraryBig}
            active={pathname === "/library"}
          />
        </div>

        {/* OS groups */}
        {operatingSystems.map((os) => {
          const OsIcon = os.icon;
          return (
            <div key={os.id}>
              <div className="flex items-center gap-2 px-3 pb-2">
                <OsIcon className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {os.name}
                </span>
              </div>
              <div className="space-y-0.5">
                {os.modules
                  .flatMap((m) => m.automations)
                  // Show installed live automations + "soon" previews; hide
                  // live automations the owner hasn't installed.
                  .filter((a) => a.status === "soon" || installed.includes(a.slug))
                  .map((a) => (
                    <AutomationNavItem
                      key={a.slug}
                      label={a.name}
                      href={a.href}
                      live={a.status === "live"}
                      active={a.href !== "" && pathname === a.href}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-line p-3">
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings}
          active={pathname === "/settings"}
        />
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent"
        />
      )}
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function AutomationNavItem({
  href,
  label,
  live,
  active,
}: {
  href: string;
  label: string;
  live: boolean;
  active: boolean;
}) {
  const content = (
    <span
      className={cn(
        "group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-white/10 font-medium text-white"
          : live
            ? "text-slate-400 hover:bg-white/5 hover:text-white"
            : "cursor-default text-slate-600",
      )}
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            live ? "bg-emerald-400" : "bg-slate-700",
          )}
        />
        {label}
      </span>
      {!live && <Sparkles className="h-3 w-3 text-slate-700" />}
    </span>
  );

  return live ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}
