"use client";

import { Wallet, FileCheck2, Tags, Calculator, Sparkles, FileText } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { LogViewer } from "@shared/ui/LogViewer";
import { StatusBadge } from "@shared/ui/StatusBadge";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { timeAgo, formatDuration } from "@shared/lib/format";
import type { RunRecord } from "@shared/services/runs";
import { EXPENSE_AGENT_PROMPT_VERSION } from "../prompts/expense-agent";
import ExpenseForm from "./ExpenseForm";

export type ExpenseViewMetrics = { total: number; successRate: number; avgRuntimeMs: number };

const PIPELINE = [
  { icon: FileCheck2, title: "Upload", body: "Drop a bank/card CSV. Rows are parsed and normalized in the browser - no raw file leaves the form." },
  { icon: Tags, title: "Categorize", body: "Gemini labels each transaction from a fixed taxonomy and cleans up merchant names." },
  { icon: Calculator, title: "Compute", body: "All totals, category sums, and burn rate run in TypeScript. The model never touches a number." },
  { icon: Sparkles, title: "Insights", body: "Gemini writes a headline and a few qualitative observations about the period." },
  { icon: FileText, title: "Report", body: "A branded PDF report is rendered with React-PDF, ready to download." },
];

const STATUS_TONE: Record<RunRecord["status"], "success" | "failed" | "running" | "neutral"> = {
  completed: "success",
  failed: "failed",
  running: "running",
  queued: "running",
  canceled: "neutral",
};

export function ExpenseAutomationView({
  runs = [],
  metrics = { total: 0, successRate: 0, avgRuntimeMs: 0 },
}: {
  runs?: RunRecord[];
  metrics?: ExpenseViewMetrics;
}) {
  return (
    <AutomationPageLayout
      eyebrow="BusinessOS / Finance"
      name="Expense Tracker"
      description="Upload a bank or card CSV and get a categorized, costed expense report with burn-rate insights and a branded PDF - in seconds."
      icon={Wallet}
      status="live"
      stats={[
        { label: "Executions", value: String(metrics.total) },
        { label: "Success Rate", value: metrics.total ? `${metrics.successRate}%` : "-" },
        { label: "Avg Runtime", value: formatDuration(metrics.avgRuntimeMs) },
        { label: "Prompt", value: EXPENSE_AGENT_PROMPT_VERSION },
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted">Step {i + 1}</span>
                    </div>
                    <h3 className="mt-3 text-base font-medium text-ink">{step.title}</h3>
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
              <ExpenseForm />
            </Card>
          ),
        },
        {
          id: "config",
          label: "Configuration",
          content: (
            <div className="grid gap-3 sm:grid-cols-2">
              <ConfigCard title="Default Currency" value="From Settings" note="Platform branding & currency apply automatically." />
              <ConfigCard title="Input" value="CSV upload or paste" note="Date, description, and amount (or debit/credit) columns." />
              <ConfigCard title="Branding" value="White-label" note="Logo, accent, footer pulled from Settings." />
              <ConfigCard title="Limit" value="200 transactions" note="Per report for the single-pass categorizer." />
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
                      message: `${r.status.toUpperCase()} / ${r.invoiceNumber ?? r.id} / ${formatDuration(r.durationMs)}`,
                    }))
                  : [{ ts: "-", level: "debug", message: "validate -> expense-agent -> computeExpense -> render-expense-pdf" }]
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
              <p>All aggregation runs in TypeScript. The model only assigns categories and writes prose, so totals and burn rate can never be hallucinated.</p>
              <p className="mt-4 font-semibold text-ink">Pipeline</p>
              <p>POST <code>/api/expenses</code> starts the <code>track-expenses</code> task: validation, categorization (Gemini), deterministic totals, then PDF rendering. The frontend polls <code>/api/expenses/:runId</code> until COMPLETED.</p>
              <p className="mt-4 font-semibold text-ink">Prompt</p>
              <p>System prompt is versioned at <code>prompts/expense-agent.ts</code> (current: {EXPENSE_AGENT_PROMPT_VERSION}).</p>
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
        icon={<Wallet className="h-6 w-6" />}
        title="No executions yet"
        description="Upload a CSV on the Run tab - every report shows up here with status, timing, and name."
      />
    );
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-[42rem] w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-semibold">Report</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Runtime</th>
              <th className="px-5 py-3 text-right font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-canvas">
                <td className="px-5 py-3 font-medium text-ink">{r.invoiceNumber ?? "-"}</td>
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
      </div>
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
