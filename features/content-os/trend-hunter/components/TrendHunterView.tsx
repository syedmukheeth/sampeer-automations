"use client";

import { Search, Zap, Flame, Lightbulb } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import TrendHunter from "./TrendHunter";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "Eight ranked content angles the moment you enter a niche - no waiting on a job." },
  { icon: Flame, title: "Scored", body: "Each headline is graded on real click-through signals: numbers, power words, length, brackets, curiosity." },
  { icon: Lightbulb, title: "Ready to film", body: "Every angle ships with a hook direction so you know exactly how to open." },
];

export function TrendHunterView() {
  return (
    <AutomationPageLayout
      eyebrow="ContentOS / Research"
      name="Trend Hunter"
      description="Spin a niche into eight proven content angles - listicle, how-to, contrarian, case study, and more - each with a scored headline and a hook direction."
      icon={Search}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Angles", value: "8" },
        { label: "Scoring", value: "Virality" },
        { label: "Engine", value: "TypeScript" },
      ]}
      tabs={[
        { id: "hunter", label: "Angles", content: <TrendHunter /> },
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
              <p className="font-semibold text-ink">Scoring signals</p>
              <p>A headline gains points for a number, a power word, an emotional word, a parenthetical, an ideal 45-65 character length, and a curiosity trigger (how/why/what). Angles are sorted best-first.</p>
              <p className="mt-4 font-semibold text-ink">Upgrade path</p>
              <p>This ranks angle templates by structure. A live-trend upgrade can feed real search volume and social momentum into the same ranking to surface breakout topics.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
