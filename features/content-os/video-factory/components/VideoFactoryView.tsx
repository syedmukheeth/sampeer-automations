"use client";

import { Video, Zap, Layers, Clapperboard } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import VideoFactory from "./VideoFactory";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "Title options, hook, full outline, thumbnail text, and a shot list rebuild live as you tweak inputs." },
  { icon: Layers, title: "Platform-aware", body: "Long-form YouTube gets a deep structure; Shorts/TikTok/Reels get a tight 3-beat loop." },
  { icon: Clapperboard, title: "Production-ready", body: "Includes a shot list and pacing targets so you can record straight from the brief." },
];

export function VideoFactoryView() {
  return (
    <AutomationPageLayout
      eyebrow="ContentOS / Create"
      name="Video Factory"
      description="Turn a topic into a complete video brief - title options, a scroll-stopping hook, a structured script outline, thumbnail text, and a shot list - in one instant pass."
      icon={Video}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Outputs", value: "Script + shots" },
        { label: "Formats", value: "Long + short" },
      ]}
      tabs={[
        { id: "factory", label: "Brief", content: <VideoFactory /> },
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
              <p className="font-semibold text-ink">Structure</p>
              <p>Section count scales with duration (≈ one block per 1.5 minutes, 3-6 blocks). Short-form switches to a pattern-interrupt → payoff → loop format. Word target assumes ~150 spoken words per minute.</p>
              <p className="mt-4 font-semibold text-ink">Upgrade path</p>
              <p>This is the deterministic brief generator. A future LLM upgrade can expand each beat into full scripted lines and auto-generate thumbnail art.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
