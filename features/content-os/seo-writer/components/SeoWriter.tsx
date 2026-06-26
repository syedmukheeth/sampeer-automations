"use client";

import { useMemo, useState } from "react";
import { Copy, Check, CircleCheck, CircleAlert, CircleX } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { analyzeSeo, type CheckStatus, type SeoInput } from "../utils/seo";

const DEFAULTS: SeoInput = {
  focusKeyword: "cold email templates",
  title: "12 Cold Email Templates That Actually Get Replies (2026)",
  metaDescription:
    "Steal 12 proven cold email templates with real reply-rate benchmarks. Copy, personalize, and book more meetings this week.",
  body: "Cold email templates only work when they feel personal. In this guide we break down 12 cold email templates that consistently get replies, with the exact structure behind each one: a sharp subject line, a one-line opener that proves you did your research, a single clear value proposition, and a low-friction call to action. You will see how to personalize each cold email template at scale, which follow-up cadence books the most meetings, and the reply-rate benchmarks to expect for B2B outbound. Use these templates as a starting point, then test subject lines and offers against your own audience.",
};

const STATUS_ICON: Record<CheckStatus, typeof CircleCheck> = {
  pass: CircleCheck,
  warn: CircleAlert,
  fail: CircleX,
};
const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: "text-success",
  warn: "text-warn",
  fail: "text-danger",
};

export default function SeoWriter() {
  const [f, setF] = useState<SeoInput>(DEFAULTS);
  const set =
    (k: keyof SeoInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setF((p) => ({ ...p, [k]: e.target.value }));

  const report = useMemo(() => analyzeSeo(f), [f]);
  const scoreColor =
    report.score >= 75 ? "text-success" : report.score >= 45 ? "text-warn" : "text-danger";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      {/* Inputs */}
      <div className="space-y-5 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <Field label="Focus keyword">
          <input value={f.focusKeyword} onChange={set("focusKeyword")} placeholder="cold email automation" className={inputCls} />
        </Field>
        <Field label="Title tag">
          <input value={f.title} onChange={set("title")} placeholder="Cold Email Automation: The 2026 Playbook" className={inputCls} />
          <Counter n={f.title.trim().length} lo={50} hi={60} />
        </Field>
        <Field label="Meta description">
          <textarea value={f.metaDescription} onChange={set("metaDescription")} placeholder="Learn how to automate cold email outreach end to end..." className={cn(inputCls, "h-20 resize-none")} />
          <Counter n={f.metaDescription.trim().length} lo={120} hi={158} />
        </Field>
        <Field label="Body content (markdown headings supported)">
          <textarea value={f.body} onChange={set("body")} placeholder="# Heading\n\nYour article content..." className={cn(inputCls, "h-64 resize-y")} />
        </Field>
      </div>

      {/* Report */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-line bg-panel p-6 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">SEO Score</p>
          <p className={cn("tabular mt-1 font-display text-5xl font-medium", scoreColor)}>{report.score}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <Mini label="Words" value={String(report.wordCount)} />
            <Mini label="Density" value={`${report.density}%`} />
            <Mini label="Reading" value={report.readabilityLabel} />
          </div>
        </div>

        {/* SERP preview */}
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">SERP preview</p>
          <div className="mt-3">
            <p className="truncate text-xs text-success">example.com › {report.slug || "your-slug"}</p>
            <p className="mt-0.5 line-clamp-1 text-base font-medium text-info">{f.title || "Your title tag"}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted">{f.metaDescription || "Your meta description preview appears here."}</p>
          </div>
          <CopyRow slug={report.slug} title={f.title} meta={f.metaDescription} />
        </div>

        {/* Checks */}
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Checks</p>
          <ul className="mt-3 space-y-2.5">
            {report.checks.map((c) => {
              const Icon = STATUS_ICON[c.status];
              return (
                <li key={c.id} className="flex items-start gap-2.5">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", STATUS_COLOR[c.status])} />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.label}</p>
                    <p className="text-xs text-muted">{c.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CopyRow({ slug, title, meta }: { slug: string; title: string; meta: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const tags = `<title>${title}</title>\n<meta name="description" content="${meta}" />\n<link rel="canonical" href="https://example.com/${slug}" />`;
    try {
      await navigator.clipboard.writeText(tags);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-50"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied meta tags" : "Copy meta tags"}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Counter({ n, lo, hi }: { n: number; lo: number; hi: number }) {
  const ok = n >= lo && n <= hi;
  return (
    <span className={cn("mt-1 block text-right text-[11px] font-medium", ok ? "text-success" : "text-muted")}>
      {n} / {lo}-{hi}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 px-2 py-2">
      <p className="tabular text-sm font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
