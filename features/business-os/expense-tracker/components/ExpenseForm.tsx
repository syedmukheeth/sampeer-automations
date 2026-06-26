"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useIsAdmin } from "@shared/ui/RoleContext";
import { DemoFillButton } from "@shared/ui/DemoFillButton";
import { computeExpense } from "../utils/calc";
import { expenseInputSchema, type ExpenseReport, type Category } from "../utils/schema";

/** Deterministic keyword categorizer — replaces the AI step for instant preview. */
function categorize(t: { description: string; amount: number }): Category {
  if (t.amount > 0) return "Income";
  const d = t.description.toLowerCase();
  if (/(ads?|google|facebook|linkedin|marketing|campaign|seo)/.test(d)) return "Marketing & Ads";
  if (/(aws|hosting|figma|notion|slack|saas|subscription|software|github|vercel|adobe|zoom|stripe)/.test(d)) return "Software & SaaS";
  if (/(contractor|payroll|salary|freelanc|design|developer|wage|hire)/.test(d)) return "Payroll & Contractors";
  if (/(rent|office|wework|coworking)/.test(d)) return "Office & Rent";
  if (/(flight|hotel|travel|uber|taxi|train|airbnb)/.test(d)) return "Travel";
  if (/(restaurant|meal|coffee|lunch|dinner|food|cafe)/.test(d)) return "Meals & Entertainment";
  if (/(laptop|monitor|hardware|device|equipment|keyboard)/.test(d)) return "Hardware";
  if (/(bank|fee|charge|interest)/.test(d)) return "Bank & Fees";
  if (/(tax|gst|vat)/.test(d)) return "Taxes";
  return "Other";
}
import { parseCsv } from "../utils/csv";
import { MAX_TRANSACTIONS, type Transaction } from "../utils/schema";

type RunState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; runId: string; status: string }
  | { phase: "done"; output: any }
  | { phase: "error"; message: string };

const SAMPLE_CSV = `Date,Description,Amount
2026-06-01,Figma subscription,-45
2026-06-02,Google Ads spend,-1200
2026-06-04,Client payment - Apex Retail,4800
2026-06-07,Notion team plan,-80
2026-06-10,Contractor - design,-1500
2026-06-12,Client payment - Northwind,6000
2026-06-15,AWS hosting,-320
2026-06-20,Client payment - Coral Beauty,2600`;

export default function ExpenseForm() {
  const [run, setRun] = useState<RunState>({ phase: "idle" });
  const [preview, setPreview] = useState<"idle" | "rendering">("idle");
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [paste, setPaste] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [f, setF] = useState<Record<string, string>>({
    name: "Expenses " + new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    periodStart: firstOfMonth(),
    periodEnd: today(),
    currency: "USD",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  // Pull default currency from platform settings (white-label).
  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!active || !s?.invoice) return;
        setF((p) => ({ ...p, currency: s.invoice.defaultCurrency || p.currency }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function ingest(text: string) {
    const { transactions, warnings } = parseCsv(text);
    const capped = transactions.slice(0, MAX_TRANSACTIONS);
    const w = [...warnings];
    if (transactions.length > MAX_TRANSACTIONS) {
      w.push(`Only the first ${MAX_TRANSACTIONS} transactions are used (got ${transactions.length}).`);
    }
    setTxns(capped);
    setWarnings(w);
    // Auto-fill the period from the data range when possible.
    const dates = capped.map((t) => t.date).filter(Boolean).sort();
    if (dates.length) {
      setF((p) => ({ ...p, periodStart: dates[0], periodEnd: dates[dates.length - 1] }));
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => ingest(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  // Instant, fully client-side report PDF — deterministic categorization +
  // totals, no Trigger.dev / AI / queue. Renders in under a second.
  async function instantPreview() {
    if (!txns.length) {
      setRun({ phase: "error", message: "Load demo data or paste a CSV first." });
      return;
    }
    const payload = {
      report: {
        name: f.name.trim(),
        periodStart: f.periodStart,
        periodEnd: f.periodEnd,
        currency: f.currency.trim(),
      },
      transactions: txns,
    };
    const parsed = expenseInputSchema.safeParse(payload);
    if (!parsed.success) {
      setRun({
        phase: "error",
        message: parsed.error.issues.map((i) => `• ${i.path.join(".")}: ${i.message}`).join("\n"),
      });
      return;
    }
    setPreview("rendering");
    try {
      const input = parsed.data;
      const categories = input.transactions.map((t) => categorize(t));
      const computed = computeExpense(input, categories);
      const report: ExpenseReport = {
        validation: { success: true, errors: [] },
        report: {
          name: input.report.name,
          periodStart: input.report.periodStart,
          periodEnd: input.report.periodEnd,
          currency: input.report.currency,
        },
        ...computed,
        headline: `${input.report.name || "Expense report"} — net ${computed.summary.net >= 0 ? "positive" : "negative"} over ${computed.summary.periodDays} days.`,
        insights: [],
        branding: { accentColor: "#6366F1" },
      };
      const { pdf } = await import("@react-pdf/renderer");
      const { ExpenseDocument } = await import("../utils/expense-pdf");
      const blob = await pdf(<ExpenseDocument report={report} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setRun({ phase: "error", message: "Preview failed: " + String(err) });
    } finally {
      setPreview("idle");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txns.length) {
      setRun({ phase: "error", message: "Upload or paste a CSV with at least one transaction." });
      return;
    }
    setRun({ phase: "submitting" });
    try {
      const payload = {
        report: {
          name: f.name.trim(),
          periodStart: f.periodStart,
          periodEnd: f.periodEnd,
          currency: f.currency.trim(),
        },
        transactions: txns,
      };
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson(res);
      if (!res.ok) {
        setRun({ phase: "error", message: formatIssues(data) });
        return;
      }
      void poll(data.runId);
    } catch (err) {
      setRun({ phase: "error", message: String(err) });
    }
  }

  async function poll(runId: string) {
    setRun({ phase: "polling", runId, status: "QUEUED" });
    for (let i = 0; i < 120; i++) {
      await sleep(2000);
      const res = await fetch(`/api/expenses/${runId}`);
      const data = await readJson(res);
      if (!res.ok) {
        setRun({ phase: "error", message: formatIssues(data) });
        return;
      }
      if (data.isCompleted) {
        const out = data.output;
        if (out?.validation && out.validation.success === false) {
          setRun({ phase: "error", message: out.validation.errors.join("\n") });
          return;
        }
        setRun({ phase: "done", output: out });
        return;
      }
      if (data.isFailed) {
        setRun({ phase: "error", message: data.error?.message ?? "Run failed" });
        return;
      }
      setRun({ phase: "polling", runId, status: data.status });
    }
    setRun({ phase: "error", message: "Timed out waiting for the report." });
  }

  const busy = run.phase === "submitting" || run.phase === "polling";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex justify-end">
        <DemoFillButton
          onLoad={() => {
            setPaste(SAMPLE_CSV);
            ingest(SAMPLE_CSV);
          }}
          onClear={() => {
            setPaste("");
            setTxns([]);
            setWarnings([]);
          }}
        />
      </div>
      <Section title="Report">
        <Field label="Report Name" v={f.name} onChange={set("name")} required />
        <Field label="Currency" v={f.currency} onChange={set("currency")} />
        <Field label="Period Start" type="date" v={f.periodStart} onChange={set("periodStart")} />
        <Field label="Period End" type="date" v={f.periodEnd} onChange={set("periodEnd")} />
      </Section>

      <Section title="Transactions (CSV)">
        <div className="sm:col-span-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-stone-50/60 px-4 py-6 text-sm font-medium text-muted transition hover:border-brand-500 hover:text-ink"
          >
            <Upload className="h-4 w-4" />
            Upload a bank/card CSV
          </button>

          <details className="mt-3 text-sm text-muted">
            <summary className="cursor-pointer">Or paste CSV text</summary>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              onBlur={() => paste.trim() && ingest(paste)}
              placeholder={"date,description,amount\n2026-06-01,Figma,-15.00\n2026-06-02,Client payment,2500.00"}
              className="mt-2 h-32 w-full rounded-lg border border-line px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </details>

          {warnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-warn">
              {warnings.slice(0, 5).map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          )}

          {txns.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <div className="flex items-center justify-between border-b border-line bg-stone-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <span>{txns.length} transactions</span>
                <button type="button" onClick={() => { setTxns([]); setWarnings([]); }} className="text-muted hover:text-danger">
                  Clear
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {txns.slice(0, 12).map((t, i) => (
                      <tr key={i} className="border-b border-line/60 last:border-0">
                        <td className="px-4 py-2 text-muted">{t.date}</td>
                        <td className="px-4 py-2 text-ink">{t.description}</td>
                        <td className={`px-4 py-2 text-right tabular ${t.amount < 0 ? "text-ink" : "text-success"}`}>
                          {t.amount.toFixed(2)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => setTxns((p) => p.filter((_, j) => j !== i))}
                            className="text-muted hover:text-danger"
                            aria-label="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {txns.length > 12 && (
                  <p className="px-4 py-2 text-xs text-muted">+ {txns.length - 12} more…</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={instantPreview}
          disabled={preview === "rendering"}
          className="rounded-xl border border-brand-200 bg-brand-50 px-6 py-3 font-semibold text-brand shadow-soft transition hover:border-brand-500 disabled:opacity-50"
        >
          {preview === "rendering" ? "Rendering..." : "⚡ Instant Preview (PDF)"}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Analyzing…" : "Generate Report"}
        </button>
        {run.phase === "polling" && <span className="text-sm text-muted">Status: {run.status}</span>}
      </div>
      <p className="-mt-4 text-xs text-muted">
        Instant Preview categorizes + renders the branded report PDF in your browser in under
        a second (no AI, no email) — ideal for live demos. Generate Report runs the full AI pipeline.
      </p>

      <Result run={run} />
    </form>
  );
}

/* ----------------------------- result panel ----------------------------- */

function Result({ run }: { run: RunState }) {
  if (run.phase === "error") {
    return (
      <pre className="whitespace-pre-wrap rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        {run.message}
      </pre>
    );
  }
  if (run.phase !== "done") return null;
  const o = run.output;
  const cur = o.report?.currency ?? "USD";
  const isAdmin = useIsAdmin();
  const money = (n: number) => (isAdmin ? "••••" : fmtMoney(n, cur));
  const maxCat = o.byCategory?.[0]?.total || 1;

  return (
    <div className="space-y-6 rounded-xl border border-line bg-panel p-6 shadow-soft">
      <div>
        <h3 className="font-display text-lg font-medium text-brand">{o.report?.name}</h3>
        {o.headline && <p className="mt-1 text-sm text-muted">{o.headline}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Spend" value={money(o.summary.totalSpend)} />
        <Stat label="Total Income" value={money(o.summary.totalIncome)} />
        <Stat label="Net" value={money(o.summary.net)} positive={o.summary.net >= 0} />
        <Stat label="Monthly Burn" value={money(o.summary.monthlyBurn)} />
      </div>

      {o.byCategory?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Spend by category</p>
          <div className="space-y-2">
            {o.byCategory.map((c: any) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{c.category}</span>
                  <span className="tabular text-muted">{money(c.total)} · {c.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.max(3, (c.total / maxCat) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {o.topMerchants?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top merchants</p>
          <div className="grid gap-1.5 text-sm sm:grid-cols-2">
            {o.topMerchants.map((m: any) => (
              <div key={m.merchant} className="flex justify-between gap-3">
                <span className="truncate text-ink">{m.merchant}</span>
                <span className="tabular shrink-0 text-muted">{money(m.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {o.insights?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Insights</p>
          <ul className="space-y-1.5 text-sm text-muted">
            {o.insights.map((t: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {o.pdfBase64 && (
        <button
          type="button"
          onClick={() => downloadPdf(o.pdfBase64, o.pdfFilename ?? "expense-report.pdf")}
          className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
        >
          Download PDF
        </button>
      )}

      <details className="text-xs text-muted">
        <summary className="cursor-pointer">View JSON</summary>
        <pre className="mt-2 overflow-auto rounded bg-stone-50 p-3">
          {JSON.stringify(stripPdf(o), null, 2)}
        </pre>
      </details>
    </div>
  );
}

/* ------------------------------- helpers -------------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-panel p-6 shadow-soft">
      <legend className="px-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  v,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  v: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        type={type}
        value={v}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-stone-50/60 p-3">
      <div className={`tabular text-lg font-semibold ${positive === false ? "text-danger" : "text-ink"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function downloadPdf(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stripPdf(o: any) {
  const { pdfBase64, ...rest } = o ?? {};
  return rest;
}

function formatIssues(data: any): string {
  if (data?.issues) return data.issues.map((i: any) => `${i.path}: ${i.message}`).join("\n");
  if (data?.detail) return `${data.error ?? "Request failed"}\n${data.detail}`;
  return data?.error ?? "Request failed";
}

async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text.trim()) {
    return { error: `Empty response from server (${res.status} ${res.statusText || "HTTP error"})` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: `Non-JSON response from server (${res.status} ${res.statusText || "HTTP error"})` };
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
