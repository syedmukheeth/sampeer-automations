"use client";

import { Receipt, FileCheck2, Calculator, Sparkles, FileText, Send } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { LogViewer } from "@shared/ui/LogViewer";
import { StatusBadge } from "@shared/ui/StatusBadge";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { timeAgo, formatDuration } from "@shared/lib/format";
import type { RunRecord } from "@shared/services/runs";
import { INVOICE_AGENT_PROMPT_VERSION } from "../prompts/invoice-agent";
import InvoiceForm from "./InvoiceForm";

export type InvoiceViewMetrics = {
  total: number;
  successRate: number;
  avgRuntimeMs: number;
};

const PIPELINE = [
  { icon: FileCheck2, title: "Validate", body: "Deterministic field checks - no invoice is generated if required data is missing." },
  { icon: Calculator, title: "Compute totals", body: "All money math runs in TypeScript. The model never touches a number." },
  { icon: Sparkles, title: "Premium prose", body: "Gemini rewrites line items and drafts the notes + client email copy." },
  { icon: FileText, title: "Render PDF", body: "A branded A4 invoice is rendered with React-PDF." },
  { icon: Send, title: "Deliver", body: "Emailed via Resend (verified domain) or Composio Gmail, PDF attached." },
];

const STATUS_TONE: Record<RunRecord["status"], "success" | "failed" | "running" | "neutral"> = {
  completed: "success",
  failed: "failed",
  running: "running",
  queued: "running",
  canceled: "neutral",
};

export function InvoiceAutomationView({
  runs = [],
  metrics = { total: 0, successRate: 0, avgRuntimeMs: 0 },
}: {
  runs?: RunRecord[];
  metrics?: InvoiceViewMetrics;
}) {
  return (
    <AutomationPageLayout
      eyebrow="BusinessOS / Finance"
      name="Invoice Generator"
      description="Validate, price, design a branded PDF, and email a premium invoice to the client automatically."
      icon={Receipt}
      accent="from-brand to-brand-700"
      status="live"
      stats={[
        { label: "Executions", value: String(metrics.total) },
        { label: "Success Rate", value: metrics.total ? `${metrics.successRate}%` : "-" },
        { label: "Avg Runtime", value: formatDuration(metrics.avgRuntimeMs) },
        { label: "Prompt", value: INVOICE_AGENT_PROMPT_VERSION },
      ]}
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PIPELINE.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Card key={step.title} className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-stone-50 text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted">Step {i + 1}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted">{step.body}</p>
                  </Card>
                );
              })}
            </div>
          ),
        },
        {
          id: "run",
          label: "Run",
          content: (
            <Card className="p-6 sm:p-8">
              <InvoiceForm />
            </Card>
          ),
        },
        {
          id: "config",
          label: "Configuration",
          content: (
            <div className="grid gap-3 sm:grid-cols-2">
              <ConfigCard title="Default Currency" value="USD" note="Override per invoice on the Run tab." />
              <ConfigCard title="Sender" value="Resend -> Composio Gmail fallback" note="Set RESEND_API_KEY + RESEND_FROM to switch." />
              <ConfigCard title="Company" value="Sampeer Studio" note="White-label fields live in env for now." />
              <ConfigCard title="PDF Theme" value="Indigo / Slate" note="Branded React-PDF document." />
            </div>
          ),
        },
        {
          id: "history",
          label: "Execution History",
          content: <ExecutionHistory runs={runs} />,
        },
        {
          id: "logs",
          label: "Logs",
          content: (
            <LogViewer
              empty="No runs yet."
              lines={
                runs.length
                  ? runs.slice(0, 20).map((r) => ({
                      ts: timeAgo(r.createdAt),
                      level: r.status === "failed" ? "error" : r.status === "completed" ? "info" : "warn",
                      message: `${r.status.toUpperCase()} / ${r.invoiceNumber ?? r.id} / ${formatDuration(r.durationMs)}${r.client ? ` / ${r.client}` : ""}`,
                    }))
                  : [
                      { ts: "-", level: "debug", message: "validate -> computeTotals -> invoice-agent -> render-pdf -> send-invoice-email" },
                    ]
              }
            />
          ),
        },
        {
          id: "docs",
          label: "Documentation",
          content: (
            <Card className="prose-sm max-w-none p-6 text-sm leading-relaxed text-muted">
              <p className="font-semibold text-ink">Core rule</p>
              <p>All money math + validation run in TypeScript. The model only writes prose, so totals can never be hallucinated.</p>
              <p className="mt-4 font-semibold text-ink">Pipeline</p>
              <p>POST <code>/api/invoices</code> starts the <code>generate-invoice</code> task, then validation, totals, Gemini prose, PDF rendering, and email delivery run in order. The frontend polls <code>/api/invoices/:runId</code> until COMPLETED.</p>
              <p className="mt-4 font-semibold text-ink">Prompt</p>
              <p>System prompt is versioned at <code>prompts/invoice-agent.ts</code> (current: {INVOICE_AGENT_PROMPT_VERSION}).</p>
            </Card>
          ),
        },
      ]}
    />
  );
}

function ExecutionHistory({ runs }: { runs: RunRecord[] }) {
  if (!runs.length) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="No executions yet"
        description="Generate an invoice on the Run tab - every execution shows up here with status, timing, and client."
      />
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-5 py-3 font-semibold">Invoice</th>
            <th className="px-5 py-3 font-semibold">Client</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Runtime</th>
            <th className="px-5 py-3 text-right font-semibold">When</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-canvas">
              <td className="px-5 py-3 font-medium text-ink">{r.invoiceNumber ?? "-"}</td>
              <td className="px-5 py-3 text-muted">{r.client ?? "-"}</td>
              <td className="px-5 py-3">
                <StatusBadge tone={STATUS_TONE[r.status]} dot>
                  {r.status}
                </StatusBadge>
              </td>
              <td className="px-5 py-3 text-muted">{formatDuration(r.durationMs)}</td>
              <td className="px-5 py-3 text-right text-muted">{timeAgo(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ConfigCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </Card>
  );
}
