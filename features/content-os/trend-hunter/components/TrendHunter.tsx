"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Flame } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { generateAngles, type AngleInput } from "../utils/angles";

const DEFAULTS: AngleInput = { niche: "", keyword: "", audience: "" };

export default function TrendHunter() {
  const [f, setF] = useState<AngleInput>(DEFAULTS);
  const set = (k: keyof AngleInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const angles = useMemo(() => generateAngles(f), [f]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-5 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <Field label="Niche / topic">
          <input value={f.niche} onChange={set("niche")} placeholder="B2B sales automation" className={inputCls} />
        </Field>
        <Field label="Focus keyword">
          <input value={f.keyword} onChange={set("keyword")} placeholder="cold email" className={inputCls} />
        </Field>
        <Field label="Audience">
          <input value={f.audience} onChange={set("audience")} placeholder="founders" className={inputCls} />
        </Field>
        <p className="border-t border-line pt-4 text-xs text-muted">
          Angles are ranked by a virality heuristic - number, power word, length, brackets, and curiosity all lift the score.
        </p>
      </div>

      <div className="space-y-3">
        {angles.map((a, i) => (
          <AngleCard key={i} {...a} />
        ))}
      </div>
    </div>
  );
}

function AngleCard({ format, headline, hook, score }: { format: string; headline: string; hook: string; score: number }) {
  const [copied, setCopied] = useState(false);
  const tone = score >= 75 ? "text-success" : score >= 55 ? "text-warn" : "text-muted";
  async function copy() {
    try {
      await navigator.clipboard.writeText(headline);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft transition hover:border-brand-500/40 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">{format}</span>
          <p className="mt-2 font-display text-lg font-medium text-ink">{headline}</p>
          <p className="mt-1 text-sm text-muted">{hook}</p>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <Flame className={cn("h-4 w-4", tone)} />
          <span className={cn("tabular mt-0.5 text-lg font-semibold", tone)}>{score}</span>
        </div>
      </div>
      <button type="button" onClick={copy} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy headline"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
