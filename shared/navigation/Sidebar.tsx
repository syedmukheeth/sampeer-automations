"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Settings, LibraryBig, Menu, X, LogOut } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { BrandLogo } from "@shared/ui/BrandLogo";
import { operatingSystems } from "@features/registry";

const shellSurface =
  "bg-[linear-gradient(180deg,#fffefa_0%,#fbfaf4_46%,#f4f8f2_100%)] text-[#6f9187]";
const shellScroll = "[scrollbar-color:#b8cfc5_transparent] [scrollbar-width:thin]";

export function Sidebar({ installed = [] }: { installed?: string[] }) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden h-dvh w-[19rem] shrink-0 flex-col overflow-hidden border-r border-sidebar-line shadow-[18px_0_42px_-34px_rgba(17,20,19,0.32)] lg:flex", shellSurface)}>
      <div className="shrink-0 px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 rounded-xl shadow-[0_12px_28px_-18px_rgba(17,20,19,0.52)] ring-1 ring-[#c8d9d1]" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-base font-medium text-[#102d28]">Sampeer Studio</p>
            <p className="text-[11px] text-[#7a8f87]">Automations console</p>
          </div>
        </div>
      </div>

      <nav className={cn("min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-3 pb-6 pr-2", shellScroll)}>
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
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#eaf4ee] ring-1 ring-inset ring-[#cfe1d8]">
                  <OsIcon className="h-3 w-3 text-[#6f9187]" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f9187]">
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

      <div className="shrink-0 border-t border-sidebar-line bg-white/70 p-3 backdrop-blur">
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
            <p className="truncate font-display text-base font-medium text-ink">Sampeer Studio</p>
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
          <aside className={cn("absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col overflow-hidden border-r border-sidebar-line shadow-2xl", shellSurface)}>
            <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-5">
              <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
                <BrandLogo className="h-10 w-10 rounded-xl shadow-[0_12px_28px_-18px_rgba(17,20,19,0.52)] ring-1 ring-[#c8d9d1]" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-display text-base font-medium text-[#102d28]">Sampeer Studio</p>
                  <p className="text-[11px] text-[#7a8f87]">Automations console</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4ee] text-[#173c36] ring-1 ring-inset ring-[#cfe1d8]"
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
      <nav className={cn("min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-3 pb-6 pr-2", shellScroll)}>
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
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#eaf4ee] ring-1 ring-inset ring-[#cfe1d8]">
                  <OsIcon className="h-3 w-3 text-[#6f9187]" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f9187]">
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

      <div className="shrink-0 border-t border-sidebar-line bg-white/70 p-3 backdrop-blur">
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
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-out hover:translate-x-0.5",
        active ? "text-[#102d28]" : "text-[#6f9187] hover:bg-[#eef7f1] hover:text-[#102d28]",
      )}
    >
      {active && <ActivePill />}
      <Icon className="relative z-10 h-4 w-4" strokeWidth={2} />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

/** Shared sliding active background + gold accent bar, animated across rows. */
function ActivePill() {
  return (
    <motion.span
      layoutId="sidebar-active"
      transition={{ type: "spring", stiffness: 430, damping: 32, mass: 0.9 }}
      className="absolute inset-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#f7fbf7_0%,#e7f4ed_58%,#fff8ea_100%)] shadow-[0_14px_30px_-24px_rgba(18,60,58,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-inset ring-[#c7ddd3]"
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-1 left-8 w-16 rounded-full bg-white/40 blur-xl"
        animate={{ x: [-28, 180], opacity: [0, 0.8, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c9963e]" />
    </motion.span>
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
        "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-300 ease-out hover:translate-x-0.5",
        active
          ? "font-medium text-[#102d28]"
          : live
            ? "text-[#6f9187] hover:bg-[#eef7f1] hover:text-[#102d28]"
            : "cursor-default text-[#a8bbb2]",
      )}
    >
      {active && <ActivePill />}
      <span className="relative z-10 flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            active
              ? "bg-[#c9963e] shadow-[0_0_10px_rgba(201,150,62,0.4)]"
              : live
                ? "bg-[#9fc8bd] group-hover:bg-[#6f9187]"
                : "bg-[#d4ded9]",
          )}
        />
        <span className="truncate">{label}</span>
      </span>
      {!live && (
        <span className="relative z-10 rounded-full bg-[#eef7f1] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8ba399]">
          Soon
        </span>
      )}
    </span>
  );

  return live ? <Link href={href} onClick={onNavigate}>{content}</Link> : <div>{content}</div>;
}
