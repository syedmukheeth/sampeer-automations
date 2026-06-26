"use client";

import { useMemo, useState } from "react";
import { Copy, Check, FileDown, Clock } from "lucide-react";
import { cn } from "@shared/lib/cn";
import {
  buildSequence,
  FRAMEWORKS,
  TONES,
  type ColdEmailInput,
  type Framework,
  type Tone,
} from "../utils/generate";

const DEFAULTS: ColdEmailInput = {
  senderName: "Sampeer",
  senderCompany: "Sampeer Studio",
  offer: "done-for-you marketing automation that follows up with every lead in under 5 minutes",
  prospectName: "Marcus",
  prospectCompany: "Brightwave",
  painPoint: "leads going cold because sales can't follow up fast enough",
  proof: "we helped a SaaS client book 38 demos in 30 days",
  cta: "a quick 15-minute call this week",
  framework: "aida",
  tone: "direct",
};

export default function ColdEmailGenerator() {
  const [f, setF] = useState<ColdEmailInput>(DEFAULTS);
  const set =
    <K extends keyof ColdEmailInput>(k: K) =>
    (v: ColdEmailInput[K]) =>
      setF((p) => ({ ...p, [k]: v }));

  const sequence = useMemo(() => buildSequence(f), [f]);

  async function downloadPdf() {
    const { pdf } = await import("@react-pdf/renderer");
    const { ColdEmailDocument } = await import("../utils/cold-email-pdf");
    const blob = await pdf(
      <ColdEmailDocument sequence={sequence} prospectCompany={f.prospectCompany} />,
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cold-email-${(f.prospectCompany || "sequence").toLowerCase().replace(/\s+/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      {/* Inputs */}
      <div className="space-y-5 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name">
            <Input value={f.senderName} onChange={set("senderName")} placeholder="Alex Rivera" />
          </Field>
          <Field label="Your company">
            <Input value={f.senderCompany} onChange={set("senderCompany")} placeholder="Sampeer Studio" />
          </Field>
        </div>

        <Field label="What you deliver (the outcome)">
          <Input value={f.offer} onChange={set("offer")} placeholder="automated client follow-ups that book more calls" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prospect name">
            <Input value={f.prospectName} onChange={set("prospectName")} placeholder="Jordan Lee" />
          </Field>
          <Field label="Prospect company">
            <Input value={f.prospectCompany} onChange={set("prospectCompany")} placeholder="Northwind" />
          </Field>
        </div>

        <Field label="Their likely pain point">
          <Input value={f.painPoint} onChange={set("painPoint")} placeholder="leads going cold before anyone replies" />
        </Field>

        <Field label="Proof / result (optional)">
          <Input value={f.proof} onChange={set("proof")} placeholder="We lifted one client's reply rate to 16%." />
        </Field>

        <Field label="Call to action">
          <Input value={f.cta} onChange={set("cta")} placeholder="a quick 15-minute call this week" />
        </Field>

        <Field label="Framework">
          <div className="grid gap-1.5">
            {FRAMEWORKS.map((fr) => (
              <button
                key={fr.id}
                type="button"
                onClick={() => set("framework")(fr.id as Framework)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                  f.framework === fr.id
                    ? "border-brand bg-brand-50 text-ink"
                    : "border-line text-muted hover:border-brand-500 hover:text-ink",
                )}
              >
                <span className="font-semibold">{fr.name}</span>
                <span className="text-xs text-muted">{fr.blurb}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tone">
          <div className="flex gap-1 rounded-lg border border-line bg-stone-50 p-1">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => set("tone")(t.id as Tone)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition",
                  f.tone === t.id ? "bg-brand text-white shadow-soft" : "text-muted hover:text-ink",
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </Field>

        <button
          type="button"
          onClick={downloadPdf}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-50"
        >
          <FileDown className="h-4 w-4" /> Export sequence PDF
        </button>
      </div>

      {/* Sequence preview */}
      <div className="space-y-4">
        {sequence.map((m) => (
          <EmailCard key={m.step} step={m.step} day={m.day} label={m.label} subject={m.subject} body={m.body} words={m.words} />
        ))}
      </div>
    </div>
  );
}

function EmailCard({
  step,
  day,
  label,
  subject,
  body,
  words,
}: {
  step: number;
  day: number;
  label: string;
  subject: string;
  body: string;
  words: number;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-soft transition hover:border-brand-500/40 hover:shadow-lift">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-stone-50/70 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
            {step}
          </span>
          <span className="text-sm font-semibold text-ink">{label}</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" /> Day {day}
          </span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:border-brand-500 hover:text-brand"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-ink">
          <span className="text-muted">Subject:</span> {subject}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/90">{body}</p>
        <p className="mt-3 text-xs text-muted">{words} words · ~{Math.max(1, Math.round(words / 200))} min read</p>
      </div>
    </div>
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

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
    />
  );
}
