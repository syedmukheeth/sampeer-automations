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
    <aside className="hidden w-[19rem] shrink-0 flex-col border-r border-sidebar-line bg-sidebar text-stone-300 lg:flex">
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-3">
          <BrandLogo className="h-10 w-10 rounded-xl ring-1 ring-white/10" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-white">Sampeer Studio</p>
            <p className="text-[11px] text-stone-500">Automations console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
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
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200",
        active
          ? "bg-white text-sidebar shadow-soft"
          : "text-stone-400 hover:bg-white/10 hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-accent"
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

  return live ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}
