"use client";

import { Mail, Zap, Layers, FileDown } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import ColdEmailGenerator from "./ColdEmailGenerator";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "The full 4-touch sequence rebuilds live as you type - no waiting on a job." },
  { icon: Layers, title: "Proven frameworks", body: "AIDA, PAS, and BAB structures with timed follow-ups and a clean breakup email." },
  { icon: FileDown, title: "Copy or export", body: "One-click copy per email, or download the whole cadence as a branded PDF." },
];

export function ColdEmailView() {
  return (
    <AutomationPageLayout
      eyebrow="SalesOS / Pipeline"
      name="Cold Email Generator"
      description="Turn a prospect and a pain point into a ready-to-send 4-touch outbound sequence - structured by a proven copy framework, timed, and exportable."
      icon={Mail}
      status="live"
      stats={[
        { label: "Touches", value: "4" },
        { label: "Latency", value: "Instant" },
        { label: "Frameworks", value: "AIDA/PAS/BAB" },
        { label: "Engine", value: "TypeScript" },
      ]}
      tabs={[
        {
          id: "generator",
          label: "Generator",
          content: <ColdEmailGenerator />,
        },
        {
          id: "about",
          label: "How it works",
          content: (
            <div className="grid gap-3 sm:grid-cols-3">
              {FEATURES.map((ft) => {
                const Icon = ft.icon;
                return (
                  <Card key={ft.title} className="p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-base font-medium text-ink">{ft.title}</h3>
                    <p className="mt-1 text-sm text-muted">{ft.body}</p>
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
              <p className="font-semibold text-ink">The cadence</p>
              <p>Four touches over ten days: first touch (day 0), a bump (day 3), a value add (day 6), and a breakup (day 10). Each is generated from your inputs - nothing is sent.</p>
              <p className="mt-4 font-semibold text-ink">Frameworks</p>
              <p><strong>AIDA</strong> opens on attention then builds to the ask. <strong>PAS</strong> leads with the problem and agitates before the solution. <strong>BAB</strong> paints the before/after then bridges to your offer.</p>
              <p className="mt-4 font-semibold text-ink">Privacy</p>
              <p>Everything runs in your browser. No prospect data is sent to a server and nothing is stored.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
