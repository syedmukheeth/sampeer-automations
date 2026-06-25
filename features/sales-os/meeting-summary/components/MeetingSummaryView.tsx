"use client";

import { Phone, Zap, CheckSquare, ShieldCheck } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import MeetingSummary from "./MeetingSummary";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "Paste notes and the summary, action items, decisions, and questions appear immediately." },
  { icon: CheckSquare, title: "Action-focused", body: "Pulls owners and to-dos so nothing from the call slips through the cracks." },
  { icon: ShieldCheck, title: "Private", body: "Runs entirely in your browser - no transcript ever leaves the page." },
];

export function MeetingSummaryView() {
  return (
    <AutomationPageLayout
      eyebrow="SalesOS / Pipeline"
      name="Meeting Summary"
      description="Paste raw call notes or a transcript and get a clean summary, attributed action items, decisions, and open questions - instantly, with one-click copy."
      icon={Phone}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Extracts", value: "Actions/Decisions" },
        { label: "Privacy", value: "On-device" },
      ]}
      tabs={[
        { id: "summary", label: "Summarize", content: <MeetingSummary /> },
        {
          id: "about",
          label: "How it works",
          content: (
            <div className="grid gap-3 sm:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <Card key={f.title} className="p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-base font-medium text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted">{f.body}</p>
                  </Card>
                );
              })}
            </div>
          ),
        },
        {
          id: "docs",
          label: "Documentation",
          content: (
            <Card className="prose-sm max-w-none p-6 text-sm leading-relaxed text-muted">
              <p className="font-semibold text-ink">Extraction</p>
              <p>Action items are sentences with commitment language (will, need to, follow up, send, schedule…). Decisions match decision words (agreed, approved, going with…). Questions are sentences ending in “?”. Owners come from speaker tags (“Alex:”) or “Name will…”.</p>
              <p className="mt-4 font-semibold text-ink">Upgrade path</p>
              <p>This is extractive (it selects existing sentences). An LLM upgrade can rewrite the summary abstractively and infer implicit owners and due dates.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
