"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { repurpose, type Format } from "../utils/repurpose";

const SAMPLE = "";

const FORMATS: { id: Format; name: string }[] = [
  { id: "thread", name: "X / Thread" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "newsletter", name: "Newsletter" },
  { id: "summary", name: "Summary" },
];

export default function RepurposeEngine() {
  const [text, setText] = useState(SAMPLE);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState<Format>("thread");

  const out = useMemo(() => repurpose(text, { handle }), [text, handle]);
  const empty = text.trim().length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Source */}
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Long-form content</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a blog post, transcript, or article…"
            className="h-80 w-full resize-y rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Your @handle / name (optional)</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@sampeerstudio"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <p className="text-xs text-muted">
          {text.trim() ? `${text.trim().split(/\s+/).length} words in` : "Paste content to repurpose it four ways."}
        </p>
      </div>

      {/* Outputs */}
      <div className="space-y-4">
        <div className="flex gap-1 rounded-xl border border-line bg-panel/70 p-1 shadow-soft">
          {FORMATS.map((fm) => (
            <button
              key={fm.id}
              type="button"
              onClick={() => setActive(fm.id)}
              className={cn(
                "flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition",
                active === fm.id ? "bg-brand text-white shadow-soft" : "text-muted hover:text-ink",
              )}
            >
              {fm.name}
            </button>
          ))}
        </div>

        {empty ? (
          <div className="rounded-2xl border border-dashed border-line bg-panel/60 p-10 text-center text-sm text-muted">
            Your repurposed content appears here.
          </div>
        ) : active === "thread" ? (
          <div className="space-y-3">
            {out.thread.map((t, i) => (
              <OutputCard key={i} title={`Tweet ${i + 1}`} text={t} small />
            ))}
          </div>
        ) : active === "summary" ? (
          <OutputCard
            title="Summary"
            text={out.summary.map((s) => `• ${s}`).join("\n")}
          />
        ) : active === "linkedin" ? (
          <OutputCard title="LinkedIn post" text={out.linkedin} />
        ) : (
          <OutputCard title="Newsletter" text={out.newsletter} />
        )}
      </div>
    </div>
  );
}

function OutputCard({ title, text, small }: { title: string; text: string; small?: boolean }) {
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
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-stone-50/70 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold text-ink">
          {title}
          {!small && <span className="text-muted">· {text.length} chars</span>}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted transition hover:border-brand-500 hover:text-brand"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-6 text-ink/90">{text}</p>
      {small && <p className="px-4 pb-2 text-[11px] text-muted">{text.length} chars</p>}
    </div>
  );
}
