"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Settings, LibraryBig, Sparkles, Menu, X, LogOut } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { BrandLogo } from "@shared/ui/BrandLogo";
import { operatingSystems } from "@features/registry";

export function Sidebar({ installed = [] }: { installed?: string[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-dvh w-[19rem] shrink-0 flex-col overflow-hidden border-r border-sidebar-line bg-sidebar text-stone-300 lg:flex">
      <div className="shrink-0 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 rounded-xl ring-1 ring-white/10" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">Sampeer Studio</p>
            <p className="text-[11px] text-stone-500">Automations console</p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-3 pb-6 pr-2 [scrollbar-color:#3a403d_transparent] [scrollbar-width:thin]">
        <div className="space-y-1">
          <NavItem href="/" label="Overview" icon={Home} active={pathname === "/"} />
          <NavItem
            href="/library"
            label="Automation Library"
            icon={LibraryBig}
            active={pathname === "/library"}
          />
        </div>

        {operatingSystems.map((os) => {
          const OsIcon = os.icon;
          const automations = os.modules
            .flatMap((m) => m.automations)
            .filter((a) => a.status === "soon" || installed.includes(a.slug));

          return (
            <div key={os.id}>
              <div className="mb-2 flex items-center gap-2 px-3">
                <OsIcon className="h-3.5 w-3.5 text-stone-500" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {os.name}
                </span>
              </div>
              <div className="space-y-0.5">
                {automations.map((a) => (
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

      <div className="shrink-0 border-t border-sidebar-line bg-sidebar p-3">
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

export function MobileNav({ installed = [] }: { installed?: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-line/80 bg-canvas/92 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <BrandLogo className="h-10 w-10 rounded-xl ring-1 ring-line" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-ink">Sampeer Studio</p>
            <p className="text-[11px] text-muted">Automations console</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href="/api/auth/logout"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel text-muted shadow-soft"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-soft"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col overflow-hidden border-r border-sidebar-line bg-sidebar text-stone-300 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-5">
              <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
                <BrandLogo className="h-10 w-10 rounded-xl ring-1 ring-white/10" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-white">Sampeer Studio</p>
                  <p className="text-[11px] text-stone-500">Automations console</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav installed={installed} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarNav({
  installed,
  onNavigate,
}: {
  installed: string[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-3 pb-6 pr-2 [scrollbar-color:#3a403d_transparent] [scrollbar-width:thin]">
        <div className="space-y-1">
          <NavItem href="/" label="Overview" icon={Home} active={pathname === "/"} onNavigate={onNavigate} />
          <NavItem
            href="/library"
            label="Automation Library"
            icon={LibraryBig}
            active={pathname === "/library"}
            onNavigate={onNavigate}
          />
        </div>

        {operatingSystems.map((os) => {
          const OsIcon = os.icon;
          const automations = os.modules
            .flatMap((m) => m.automations)
            .filter((a) => a.status === "soon" || installed.includes(a.slug));

          return (
            <div key={os.id}>
              <div className="mb-2 flex items-center gap-2 px-3">
                <OsIcon className="h-3.5 w-3.5 text-stone-500" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  {os.name}
                </span>
              </div>
              <div className="space-y-0.5">
                {automations.map((a) => (
                  <AutomationNavItem
                    key={a.slug}
                    label={a.name}
                    href={a.href}
                    live={a.status === "live"}
                    active={a.href !== "" && pathname === a.href}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-line bg-sidebar p-3">
        <NavItem
          href="/settings"
          label="Settings"
          icon={Settings}
          active={pathname === "/settings"}
          onNavigate={onNavigate}
        />
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
        active
          ? "bg-white text-sidebar shadow-soft"
          : "text-stone-400 hover:bg-white/10 hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent"
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
  onNavigate,
}: {
  href: string;
  label: string;
  live: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const content = (
    <span
      className={cn(
        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition duration-200",
        active
          ? "bg-white/12 font-medium text-white"
          : live
            ? "text-stone-400 hover:bg-white/10 hover:text-white"
            : "cursor-default text-stone-600",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            live ? "bg-brand-100" : "bg-stone-700",
          )}
        />
        <span className="truncate">{label}</span>
      </span>
      {!live && <Sparkles className="h-3 w-3 text-stone-700" />}
    </span>
  );

  return live ? <Link href={href} onClick={onNavigate}>{content}</Link> : <div>{content}</div>;
}
