"use client";

import { LineChart, Zap, ShieldCheck, FileDown } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import GrowthAnalytics from "./GrowthAnalytics";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "CAC, ROAS, conversion, and ROI recompute live as you edit the channel table." },
  { icon: ShieldCheck, title: "Deterministic", body: "Every metric is a guarded division in TypeScript - no NaN, no LLM, no guessing." },
  { icon: FileDown, title: "Export", body: "Download a branded PDF of the channel breakdown and blended performance." },
];

export function GrowthAnalyticsView() {
  return (
    <AutomationPageLayout
      eyebrow="GrowthOS / Insight"
      name="Growth Analytics"
      description="Drop in spend, leads, customers, and revenue per channel to get instant CAC, ROAS, conversion, and a blended ROI roll-up - with a branded PDF export."
      icon={LineChart}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Metrics", value: "CAC/ROAS/ROI" },
        { label: "Export", value: "PDF" },
      ]}
      tabs={[
        {
          id: "dashboard",
          label: "Dashboard",
          content: <GrowthAnalytics />,
        },
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
              <p className="font-semibold text-ink">Metrics</p>
              <p><strong>CAC</strong> = spend ÷ customers. <strong>CPL</strong> = spend ÷ leads. <strong>Conversion</strong> = customers ÷ leads. <strong>ROAS</strong> = revenue ÷ spend. <strong>ROI</strong> = (revenue − spend) ÷ spend.</p>
              <p className="mt-4 font-semibold text-ink">Blended</p>
              <p>The roll-up sums every channel first, then divides - so a blended CAC is true total spend over true total customers, not an average of averages.</p>
              <p className="mt-4 font-semibold text-ink">Privacy</p>
              <p>Everything runs in your browser. No figures are sent to a server and nothing is stored.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
