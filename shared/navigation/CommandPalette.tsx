"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { liveAutomations, operatingSystems } from "@features/registry";

const osName = (osId: string) =>
  operatingSystems.find((o) => o.id === osId)?.name ?? "";

/**
 * Global automation search (Ctrl/⌘ + K). Filters live automations by name, OS,
 * and tags; arrow keys move, Enter navigates. Replaces the old static, dead
 * search box. Rendered by the Topbar; the keyboard shortcut works app-wide.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMac(
      typeof navigator !== "undefined" && /mac/i.test(navigator.platform),
    );
  }, []);

  // Global Ctrl/⌘+K toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input and reset state when opening.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return liveAutomations;
    return liveAutomations.filter((a) => {
      const hay = `${a.name} ${osName(a.osId)} ${a.tags.join(" ")} ${a.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActive((i) => Math.min(i, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const go = (href: string) => {
    if (!href) return;
    setOpen(false);
    router.push(href);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  // Scroll the active row into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  return (
    <>
      {/* Trigger — looks like the old search box, now a real button. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-line bg-panel/80 px-3 text-sm text-muted shadow-soft transition duration-200 hover:border-brand-500/60 hover:text-ink"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search automations</span>
        <span className="hidden items-center gap-1 rounded-md border border-line bg-stone-50 px-1.5 py-0.5 text-[11px] font-medium text-muted sm:inline-flex">
          {isMac ? "⌘" : "Ctrl"} K
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            onKeyDown={onListKey}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search automations…"
                className="!border-0 !bg-transparent !px-0 !py-3.5 !shadow-none focus:!shadow-none flex-1 text-sm text-ink outline-none"
              />
              <kbd className="hidden rounded-md border border-line bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline-block">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  No automations match “{query}”.
                </p>
              ) : (
                results.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.slug}
                      data-idx={i}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(a.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        i === active ? "bg-brand-50" : "hover:bg-brand-50/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                          a.accent,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {a.name}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {osName(a.osId)}
                        </span>
                      </span>
                      {i === active && (
                        <CornerDownLeft className="h-4 w-4 shrink-0 text-muted" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
