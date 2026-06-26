"use client";

import { useMemo, useState } from "react";
import { Copy, Check, CheckSquare, Gavel, HelpCircle, Users } from "lucide-react";
import { summarize } from "../utils/summarize";

const SAMPLE_NOTES = `Kickoff call with Brightwave (Marcus, VP Growth) and our team (Sampeer, Priya).

Marcus said their biggest problem is leads going cold - reps take 12+ hours to follow up. They want every inbound lead contacted in under 5 minutes.

We agreed to roll out the lead-pipeline automation plus an auto-responder in week one.
Decision: start with a 30-day pilot priced at $6k, then move to a monthly retainer if booked-demo target is hit.
Priya will send the proposal by Friday.
Marcus will get us API access to their CRM by Wednesday.
Open question: do they need multi-language email support for the EU market?
Next meeting scheduled for next Tuesday to review the pilot plan.`;

export default function MeetingSummary() {
  const [text, setText] = useState(SAMPLE_NOTES);
  const result = useMemo(() => summarize(text), [text]);
  const empty = text.trim().length === 0;

  const fullText = useMemo(() => {
    const parts = [
      `SUMMARY:\n${result.summary.map((s) => `- ${s}`).join("\n")}`,
      result.actionItems.length
        ? `ACTION ITEMS:\n${result.actionItems.map((a) => `- ${a.owner ? `[${a.owner}] ` : ""}${a.text}`).join("\n")}`
        : "",
      result.decisions.length ? `DECISIONS:\n${result.decisions.map((d) => `- ${d}`).join("\n")}` : "",
      result.questions.length ? `OPEN QUESTIONS:\n${result.questions.map((q) => `- ${q}`).join("\n")}` : "",
    ].filter(Boolean);
    return parts.join("\n\n");
  }, [result]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink">Meeting notes / transcript</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"Paste raw notes or a transcript.\n\nTip: speaker tags like \"Alex:\" help attribute action items."}
            className="h-96 w-full resize-y rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {result.wordCount} words · {result.speakers.length} speaker{result.speakers.length === 1 ? "" : "s"}
          </p>
          {!empty && <CopyButton text={fullText} />}
        </div>
      </div>

      <div className="space-y-4">
        {empty ? (
          <div className="rounded-2xl border border-dashed border-line bg-panel/60 p-10 text-center text-sm text-muted">
            Your summary, action items, decisions, and open questions appear here.
          </div>
        ) : (
          <>
            {result.speakers.length > 0 && (
              <Section icon={Users} title="Attendees">
                <div className="flex flex-wrap gap-1.5">
                  {result.speakers.map((s) => (
                    <span key={s} className="rounded-full border border-line bg-stone-50 px-2.5 py-1 text-xs font-medium text-ink">{s}</span>
                  ))}
                </div>
              </Section>
            )}
            <Section title="Summary">
              <ul className="space-y-1.5">
                {result.summary.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink/90"><span className="text-brand">·</span>{s}</li>
                ))}
              </ul>
            </Section>
            <Section icon={CheckSquare} title={`Action items (${result.actionItems.length})`}>
              {result.actionItems.length ? (
                <ul className="space-y-2">
                  {result.actionItems.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink/90">
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{a.owner && <span className="mr-1 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand">{a.owner}</span>}{a.text}</span>
                    </li>
                  ))}
                </ul>
              ) : <Empty />}
            </Section>
            <div className="grid gap-4 sm:grid-cols-2">
              <Section icon={Gavel} title="Decisions">
                {result.decisions.length ? (
                  <ul className="space-y-1.5">{result.decisions.map((d, i) => <li key={i} className="text-sm text-ink/90">{d}</li>)}</ul>
                ) : <Empty />}
              </Section>
              <Section icon={HelpCircle} title="Open questions">
                {result.questions.length ? (
                  <ul className="space-y-1.5">{result.questions.map((q, i) => <li key={i} className="text-sm text-ink/90">{q}</li>)}</ul>
                ) : <Empty />}
              </Section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon?: typeof Users; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {Icon && <Icon className="h-4 w-4 text-brand" />} {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted/70">None detected.</p>;
}

function CopyButton({ text }: { text: string }) {
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
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand-50">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy all"}
    </button>
  );
}
