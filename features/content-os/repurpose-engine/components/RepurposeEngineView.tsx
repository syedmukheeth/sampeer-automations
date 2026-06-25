"use client";

import { Repeat, Zap, Layers, Copy } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import RepurposeEngine from "./RepurposeEngine";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "All four formats rebuild live as you paste and edit - no waiting on a job." },
  { icon: Layers, title: "Four channels", body: "One draft becomes an X thread, a LinkedIn post, a newsletter blurb, and a summary." },
  { icon: Copy, title: "Copy-ready", body: "Each output has its own copy button with live character counts per piece." },
];

export function RepurposeEngineView() {
  return (
    <AutomationPageLayout
      eyebrow="ContentOS / Create"
      name="Repurpose Engine"
      description="Turn one long-form draft into a tweet/X thread, a LinkedIn post, a newsletter blurb, and a bullet summary - instantly, all rule-based and copy-ready."
      icon={Repeat}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Outputs", value: "4" },
        { label: "Thread", value: "≤270/post" },
      ]}
      tabs={[
        {
          id: "repurpose",
          label: "Repurpose",
          content: <RepurposeEngine />,
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
              <p className="font-semibold text-ink">Thread</p>
              <p>Sentences are packed into numbered posts that stay under 270 characters, so the thread is ready to schedule without manual trimming.</p>
              <p className="mt-4 font-semibold text-ink">LinkedIn / Newsletter</p>
              <p>The opening sentence becomes the hook; following sentences form the body and bullet points, with an optional sign-off from your handle.</p>
              <p className="mt-4 font-semibold text-ink">Privacy</p>
              <p>Everything runs in your browser. No content is sent to a server and nothing is stored.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
