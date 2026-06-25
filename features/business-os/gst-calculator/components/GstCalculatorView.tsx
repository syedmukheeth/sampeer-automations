"use client";

import { Calculator, Zap, ShieldCheck, FileDown } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import GstCalculator from "./GstCalculator";

const FEATURES = [
  { icon: Zap, title: "Instant", body: "Live calculation as you type - no waiting on a background job." },
  { icon: ShieldCheck, title: "Deterministic", body: "Every figure is computed in TypeScript with integer-cent rounding." },
  { icon: FileDown, title: "Export", body: "Download a clean, branded PDF of the breakdown for records." },
];

export function GstCalculatorView() {
  return (
    <AutomationPageLayout
      eyebrow="BusinessOS / Finance"
      name="GST / Tax Calculator"
      description="Compute GST, VAT, or sales tax with inclusive/exclusive modes and CGST/SGST/IGST splits - instantly, with a branded PDF export."
      icon={Calculator}
      status="live"
      stats={[
        { label: "Latency", value: "Instant" },
        { label: "Engine", value: "TypeScript" },
        { label: "Modes", value: "Incl / Excl" },
        { label: "Splits", value: "CGST/SGST/IGST" },
      ]}
      tabs={[
        {
          id: "calculator",
          label: "Calculator",
          content: <GstCalculator />,
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
              <p className="font-semibold text-ink">Modes</p>
              <p><strong>Pre-tax (exclusive):</strong> the amount is the net base; tax is added on top. <strong>Tax inclusive:</strong> the amount already contains tax; the base is back-calculated as amount ÷ (1 + rate).</p>
              <p className="mt-4 font-semibold text-ink">Splits</p>
              <p>CGST+SGST divides the tax in half (intra-state, India). IGST keeps the full tax as a single line (inter-state). None is for plain GST/VAT.</p>
              <p className="mt-4 font-semibold text-ink">Privacy</p>
              <p>Everything runs in your browser. No figures are sent to a server and nothing is stored.</p>
            </Card>
          ),
        },
      ]}
    />
  );
}
