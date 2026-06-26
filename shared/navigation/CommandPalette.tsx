"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
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
        aria-label="Open automation search"
        className="flex h-11 w-full max-w-lg items-center gap-3 rounded-2xl border border-line bg-panel/90 px-4 text-sm text-muted shadow-soft transition duration-200 hover:border-brand-500/50 hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Search className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left">Search automations</span>
        <span className="hidden items-center gap-1 rounded-lg border border-line bg-stone-50 px-2 py-1 text-[11px] font-medium text-muted sm:inline-flex">
          {isMac ? "Cmd" : "Ctrl"} K
        </span>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex min-h-dvh items-start justify-center p-3 pt-[9vh] sm:p-4 sm:pt-[11vh]">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-white/55 backdrop-blur-md"
          />
          <div
            role="dialog"
            aria-modal="true"
            onKeyDown={onListKey}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d7d0c1] bg-[#fffefa] shadow-[0_24px_80px_-34px_rgba(17,20,19,0.5)]"
          >
            <div className="flex items-center gap-3 border-b border-line bg-white/70 px-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                <Search className="h-4 w-4" />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by automation, OS, or tag"
                className="!border-0 !bg-transparent !px-0 !py-4 !shadow-none focus:!shadow-none flex-1 text-sm text-ink outline-none placeholder:text-muted/60"
              />
              <kbd className="hidden rounded-lg border border-line bg-stone-50 px-2 py-1 text-[10px] font-medium text-muted sm:inline-block">
                Esc
              </kbd>
            </div>

            <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              <span>Automations</span>
              <span>{results.length} found</span>
            </div>

            <div ref={listRef} className="max-h-[48vh] overflow-y-auto px-2 pb-2">
              {results.length === 0 ? (
                <div className="mx-2 my-3 rounded-2xl border border-dashed border-line bg-stone-50/70 px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-ink">No matches</p>
                  <p className="mt-1 text-sm text-muted">
                    Try a product name, OS, or tag like invoice, content, sales, or analytics.
                  </p>
                </div>
              ) : (
                results.map((a, i) => {
                  const Icon = a.icon;
                  const tags = a.tags.slice(0, 2);
                  return (
                    <button
                      key={a.slug}
                      data-idx={i}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(a.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition duration-150",
                        i === active
                          ? "border-brand-100 bg-brand-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                          : "border-transparent hover:border-line hover:bg-stone-50/70",
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
                        <span className="block truncate text-sm font-semibold text-ink">
                          {a.name}
                        </span>
                        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted">
                          <span className="truncate">{osName(a.osId)}</span>
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-line bg-white/75 px-1.5 py-0.5 text-[10px] font-medium text-muted"
                            >
                              {tag}
                            </span>
                          ))}
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

            <div className="flex items-center gap-4 border-t border-line bg-stone-50/70 px-4 py-2.5 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> open
              </span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
