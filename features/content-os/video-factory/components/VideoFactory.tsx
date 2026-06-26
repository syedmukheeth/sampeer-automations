"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Film, Image as ImageIcon, Clapperboard } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { buildScript, type ScriptInput, type VideoTone, type Platform } from "../utils/script";

const DEFAULTS: ScriptInput = {
  topic: "How to get your first 1,000 customers with cold email",
  audience: "B2B founders and early-stage marketers",
  durationMin: 8,
  tone: "educational",
  platform: "youtube",
};

const TONES: { id: VideoTone; name: string }[] = [
  { id: "educational", name: "Educational" },
  { id: "entertaining", name: "Entertaining" },
  { id: "promotional", name: "Promotional" },
];
const PLATFORMS: { id: Platform; name: string }[] = [
  { id: "youtube", name: "YouTube" },
  { id: "shorts", name: "Shorts" },
  { id: "tiktok", name: "TikTok" },
  { id: "reel", name: "Reel" },
];

export default function VideoFactory() {
  const [f, setF] = useState<ScriptInput>(DEFAULTS);
  const set = <K extends keyof ScriptInput>(k: K) => (v: ScriptInput[K]) => setF((p) => ({ ...p, [k]: v }));
  const script = useMemo(() => buildScript(f), [f]);

  const fullText = useMemo(() => {
    const lines = [
      `TITLE OPTIONS:\n${script.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
      `HOOK:\n${script.hook}`,
      `SCRIPT:\n${script.sections.map((s) => `${s.heading}\n${s.beats.map((b) => `  - ${b}`).join("\n")}`).join("\n\n")}`,
      `OUTRO:\n${script.outro}`,
      `THUMBNAIL TEXT: ${script.thumbnailText.join(" | ")}`,
      `SHOT LIST:\n${script.shotList.map((s) => `  - ${s}`).join("\n")}`,
    ];
    return lines.join("\n\n");
  }, [script]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      {/* Inputs */}
      <div className="space-y-5 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <Field label="Video topic">
          <input value={f.topic} onChange={(e) => set("topic")(e.target.value)} placeholder="Automating cold email outreach" className={inputCls} />
        </Field>
        <Field label="Audience">
          <input value={f.audience} onChange={(e) => set("audience")(e.target.value)} placeholder="solo founders" className={inputCls} />
        </Field>
        <Field label={`Duration: ${f.durationMin} min`}>
          <input type="range" min={1} max={20} value={f.durationMin} onChange={(e) => set("durationMin")(Number(e.target.value))} className="w-full accent-brand" />
        </Field>
        <Field label="Tone">
          <Segmented value={f.tone} options={TONES} onChange={(v) => set("tone")(v as VideoTone)} />
        </Field>
        <Field label="Platform">
          <Segmented value={f.platform} options={PLATFORMS} onChange={(v) => set("platform")(v as Platform)} />
        </Field>
        <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-center text-sm">
          <Stat label="Word target" value={String(script.wordTarget)} />
          <Stat label="Est. length" value={`${Math.round(script.estSeconds / 60)}m`} />
        </div>
        <CopyButton text={fullText} label="Copy full script" />
      </div>

      {/* Script */}
      <div className="space-y-4">
        <Block icon={Film} title="Title options">
          <ol className="space-y-1.5">
            {script.titles.map((t, i) => (
              <li key={i} className="text-sm text-ink"><span className="text-muted">{i + 1}.</span> {t}</li>
            ))}
          </ol>
        </Block>

        <Block icon={Clapperboard} title="Hook">
          <p className="text-sm leading-6 text-ink/90">{script.hook}</p>
        </Block>

        <Block title="Script outline">
          <div className="space-y-4">
            {script.sections.map((s, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-ink">{s.heading}</p>
                <ul className="mt-1 space-y-1">
                  {s.beats.map((b, j) => (
                    <li key={j} className="flex gap-2 text-sm text-muted"><span className="text-brand">·</span>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <p className="text-sm font-semibold text-ink">Outro</p>
              <p className="mt-1 text-sm text-muted">{script.outro}</p>
            </div>
          </div>
        </Block>

        <div className="grid gap-4 sm:grid-cols-2">
          <Block icon={ImageIcon} title="Thumbnail text">
            <div className="flex flex-wrap gap-2">
              {script.thumbnailText.map((t) => (
                <span key={t} className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-brand">{t}</span>
              ))}
            </div>
          </Block>
          <Block title="Shot list">
            <ul className="space-y-1">
              {script.shotList.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted"><span className="text-brand">{i + 1}.</span>{s}</li>
              ))}
            </ul>
          </Block>
        </div>
      </div>
    </div>
  );
}

function Block({ icon: Icon, title, children }: { icon?: typeof Film; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {Icon && <Icon className="h-4 w-4 text-brand" />} {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button type="button" onClick={copy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-50">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </button>
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

function Segmented({ value, options, onChange }: { value: string; options: { id: string; name: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-stone-50 p-1">
      {options.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)} className={cn("flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition", value === o.id ? "bg-brand text-white shadow-soft" : "text-muted hover:text-ink")}>
          {o.name}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="tabular text-lg font-semibold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
