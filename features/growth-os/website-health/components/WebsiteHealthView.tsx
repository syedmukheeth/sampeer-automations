"use client";

import { Gauge, Zap, ShieldCheck, ListChecks } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import WebsiteHealth from "./WebsiteHealth";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "Grade, sub-scores, and prioritized fixes recompute live as you adjust metrics." },
  { icon: ShieldCheck, title: "Standards-based", body: "Core Web Vitals use Google's exact good/needs-improvement/poor thresholds." },
  { icon: ListChecks, title: "Actionable", body: "Recommendations are ranked high → low so you fix what moves rankings first." },
];

export function WebsiteHealthView() {
  return (
    <AutomationPageLayout
      eyebrow="GrowthOS / Insight"
      name="Website Health"
      description="Enter Core Web Vitals and a quick best-practice checklist to get an instant performance + SEO grade with prioritized, plain-English recommendations."
      icon={Gauge}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Vitals", value: "LCP/INP/CLS" },
        { label: "Output", value: "Grade A-F" },
      ]}
      tabs={[
        { id: "audit", label: "Audit", content: <WebsiteHealth /> },
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
              <p className="font-semibold text-ink">Thresholds</p>
              <p>LCP good ≤ 2.5s / poor &gt; 4s. INP good ≤ 200ms / poor &gt; 500ms. CLS good ≤ 0.1 / poor &gt; 0.25. Performance weights CWV at 75% plus a payload/request signal; the overall grade is 60% performance, 40% SEO.</p>
              <p className="mt-4 font-semibold text-ink">Upgrade path</p>
              <p>Today you enter metrics from PageSpeed/Lighthouse. A live-crawl upgrade can fetch the URL and pull these numbers automatically.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
