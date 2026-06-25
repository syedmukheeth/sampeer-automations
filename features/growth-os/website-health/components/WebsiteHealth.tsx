"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpCircle, MinusCircle } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { auditSite, type AuditInput, type Rating } from "../utils/audit";

const DEFAULTS: AuditInput = {
  lcp: 2.8,
  inp: 220,
  cls: 0.12,
  ttfb: 600,
  pageWeightKb: 1800,
  requests: 64,
  https: true,
  mobileFriendly: true,
  hasMetaDescription: true,
  hasH1: true,
  hasAltText: false,
  hasSitemap: false,
};

const RATING_STYLE: Record<Rating, string> = {
  good: "text-success",
  "needs-improvement": "text-warn",
  poor: "text-danger",
};
const RATING_LABEL: Record<Rating, string> = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
};

const CHECKS: { key: keyof AuditInput; label: string }[] = [
  { key: "https", label: "HTTPS" },
  { key: "mobileFriendly", label: "Mobile-friendly" },
  { key: "hasMetaDescription", label: "Meta description" },
  { key: "hasH1", label: "Single H1" },
  { key: "hasAltText", label: "Image alt text" },
  { key: "hasSitemap", label: "XML sitemap" },
];

const PRIORITY_ICON = { high: ArrowUpCircle, medium: AlertTriangle, low: MinusCircle } as const;
const PRIORITY_STYLE = { high: "text-danger", medium: "text-warn", low: "text-muted" } as const;

export default function WebsiteHealth() {
  const [f, setF] = useState<AuditInput>(DEFAULTS);
  const setNum = (k: keyof AuditInput) => (v: string) => setF((p) => ({ ...p, [k]: Number(v) || 0 }));
  const toggle = (k: keyof AuditInput) => () => setF((p) => ({ ...p, [k]: !p[k] }));
  const r = useMemo(() => auditSite(f), [f]);
  const gradeColor = r.overall >= 80 ? "text-success" : r.overall >= 60 ? "text-warn" : "text-danger";

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      {/* Inputs */}
      <div className="space-y-5 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Core Web Vitals</p>
        <div className="grid grid-cols-2 gap-3">
          <Num label="LCP (s)" value={f.lcp} step={0.1} onChange={setNum("lcp")} />
          <Num label="INP (ms)" value={f.inp} onChange={setNum("inp")} />
          <Num label="CLS" value={f.cls} step={0.01} onChange={setNum("cls")} />
          <Num label="TTFB (ms)" value={f.ttfb} onChange={setNum("ttfb")} />
          <Num label="Page weight (KB)" value={f.pageWeightKb} onChange={setNum("pageWeightKb")} />
          <Num label="Requests" value={f.requests} onChange={setNum("requests")} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Best practices</p>
        <div className="grid grid-cols-2 gap-2">
          {CHECKS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={toggle(c.key)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition",
                f[c.key] ? "border-brand bg-brand-50 text-ink" : "border-line text-muted hover:border-brand-500",
              )}
            >
              {c.label}
              <span className={cn("h-2 w-2 rounded-full", f[c.key] ? "bg-success" : "bg-stone-300")} />
            </button>
          ))}
        </div>
      </div>

      {/* Report */}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-panel p-6 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Overall</p>
            <p className={cn("font-display text-5xl font-medium", gradeColor)}>{r.grade}</p>
            <p className="tabular text-sm text-muted">{r.overall}/100</p>
          </div>
          <Score label="Performance" value={r.perfScore} />
          <Score label="SEO / Best practices" value={r.seoScore} />
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Core Web Vitals</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Vital label="LCP" value={`${f.lcp}s`} rating={r.cwv.lcp} />
            <Vital label="INP" value={`${f.inp}ms`} rating={r.cwv.inp} />
            <Vital label="CLS" value={String(f.cls)} rating={r.cwv.cls} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Recommendations ({r.recommendations.length})</p>
          {r.recommendations.length ? (
            <ul className="mt-3 space-y-2.5">
              {r.recommendations.map((rec, i) => {
                const Icon = PRIORITY_ICON[rec.priority];
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", PRIORITY_STYLE[rec.priority])} />
                    <span className="text-sm text-ink/90">{rec.text}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-success">No issues found - this site is in great shape.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Num({ label, value, onChange, step }: { label: string; value: number; onChange: (v: string) => void; step?: number }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      <input
        type="number"
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-success" : value >= 60 ? "text-warn" : "text-danger";
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className={cn("tabular font-display text-4xl font-medium", color)}>{value}</p>
    </div>
  );
}

function Vital({ label, value, rating }: { label: string; value: string; rating: Rating }) {
  return (
    <div className="rounded-xl bg-stone-50 px-2 py-3">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="tabular mt-0.5 text-base font-semibold text-ink">{value}</p>
      <p className={cn("mt-0.5 text-xs font-semibold", RATING_STYLE[rating])}>{RATING_LABEL[rating]}</p>
    </div>
  );
}
