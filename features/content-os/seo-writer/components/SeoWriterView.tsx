"use client";

import { PenLine, Zap, ShieldCheck, Search } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import SeoWriter from "./SeoWriter";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "The score and every check recompute live as you write - no waiting on a job." },
  { icon: ShieldCheck, title: "Deterministic", body: "Each rule is plain TypeScript: title/meta length, keyword placement, density, readability." },
  { icon: Search, title: "SERP preview", body: "See the Google snippet and copy production-ready meta tags in one click." },
];

export function SeoWriterView() {
  return (
    <AutomationPageLayout
      eyebrow="ContentOS / Create"
      name="SEO Writer"
      description="Score a draft against on-page SEO best practices - title and meta length, keyword placement and density, heading structure, and Flesch readability - with a live SERP preview."
      icon={PenLine}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Checks", value: "8" },
        { label: "Readability", value: "Flesch" },
      ]}
      tabs={[
        {
          id: "editor",
          label: "Optimizer",
          content: <SeoWriter />,
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
              <p className="font-semibold text-ink">Scoring</p>
              <p>Eight weighted checks (pass = 1, warn = 0.5, fail = 0) average into a 0-100 score. Targets follow common best practice: title 50-60 chars, meta 120-158, keyword density 0.5-2.5%, 600+ words, Flesch 60+.</p>
              <p className="mt-4 font-semibold text-ink">Readability</p>
              <p>Flesch reading ease is computed from words, sentences, and a heuristic syllable count - higher is easier. ~60-70 reads as plain English.</p>
              <p className="mt-4 font-semibold text-ink">Privacy</p>
              <p>Everything runs in your browser. No content is sent to a server and nothing is stored.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
