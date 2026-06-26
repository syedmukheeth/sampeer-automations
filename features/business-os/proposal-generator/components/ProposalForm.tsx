"use client";

import { useEffect, useState } from "react";
import { useIsAdmin } from "@shared/ui/RoleContext";
import { DemoFillButton } from "@shared/ui/DemoFillButton";

type Item = { name: string; description: string; quantity: string; unitPrice: string };

type RunState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "polling"; runId: string; status: string }
  | { phase: "done"; output: any }
  | { phase: "error"; message: string };

const emptyItem = (): Item => ({ name: "", description: "", quantity: "1", unitPrice: "" });

export default function ProposalForm() {
  const [run, setRun] = useState<RunState>({ phase: "idle" });
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [f, setF] = useState<Record<string, string>>({
    "company.name": "Sampeer Studio",
    "company.address": "",
    "company.email": "",
    "client.name": "",
    "client.email": "",
    "client.company": "",
    "proposal.title": "",
    "proposal.number": "",
    "proposal.date": today(),
    "proposal.validUntil": plusDays(14),
    "proposal.preparedBy": "",
    "project.name": "",
    "project.summary": "",
    currency: "USD",
    "discount.value": "",
    "tax.rate": "",
    terms: "",
    notes: "",
  });

  // "Load demo data" fills a believable proposal for a live client demo. The
  // client email points at the studio inbox so demo sends land with you.
  function loadDemo() {
    setF((p) => ({
      ...p,
      "client.name": "Marcus Lee",
      "client.email": "smpeer05@gmail.com",
      "client.company": "Brightwave SaaS",
      "proposal.title": "Growth Partnership Proposal",
      "proposal.number": "PROP-DEMO-001",
      "proposal.preparedBy": "Sampeer",
      "project.name": "GrowthOS Rollout",
      "project.summary": "Full-funnel growth program: lead capture, fast follow-up, and monthly content.",
      terms: "50% to start, 50% on delivery.",
    }));
    setItems([
      { name: "Strategy & setup", description: "Audit, channel plan, and automation setup", quantity: "1", unitPrice: "3000" },
      { name: "Monthly retainer", description: "Campaign management + reporting", quantity: "3", unitPrice: "2000" },
    ]);
  }
  function clearForm() {
    setF((p) => ({
      ...p,
      "client.name": "",
      "client.email": "",
      "client.company": "",
      "proposal.title": "",
      "proposal.number": "",
      "proposal.preparedBy": "",
      "project.name": "",
      "project.summary": "",
      terms: "",
      notes: "",
    }));
    setItems([emptyItem()]);
  }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!active || !s) return;
        const b = s.branding ?? {};
        const inv = s.invoice ?? {};
        setF((p) => ({
          ...p,
          "company.name": b.companyName || p["company.name"],
          "company.email": b.companyEmail || p["company.email"],
          "company.address": b.companyAddress || p["company.address"],
          currency: inv.defaultCurrency || p.currency,
          "proposal.number": p["proposal.number"] || `PROP-${new Date().getFullYear()}-`,
        }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  function buildPayload() {
    const payload: any = {
      company: trimObj({
        name: f["company.name"],
        address: f["company.address"],
        email: f["company.email"] || undefined,
      }),
      client: trimObj({
        name: f["client.name"],
        email: f["client.email"],
        company: f["client.company"] || undefined,
      }),
      proposal: trimObj({
        title: f["proposal.title"],
        number: f["proposal.number"],
        date: f["proposal.date"],
        validUntil: f["proposal.validUntil"],
        preparedBy: f["proposal.preparedBy"] || undefined,
      }),
      project: trimObj({ name: f["project.name"], summary: f["project.summary"] || undefined }),
      currency: f.currency.trim(),
      items: items.map((it) => ({
        name: it.name.trim(),
        description: it.description.trim() || undefined,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    };
    if (f["discount.value"]) payload.discount = { type: "percent", value: Number(f["discount.value"]) };
    if (f["tax.rate"]) payload.tax = { name: "Tax", rate: Number(f["tax.rate"]) };
    if (f.terms.trim()) payload.terms = f.terms.trim();
    if (f.notes.trim()) payload.notes = f.notes.trim();
    return payload;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRun({ phase: "submitting" });
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
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
      const res = await fetch(`/api/proposals/${runId}`);
      const data = await res.json();
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
    setRun({ phase: "error", message: "Timed out waiting for the proposal run." });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex justify-end">
        <DemoFillButton onLoad={loadDemo} onClear={clearForm} />
      </div>
      <Section title="Client">
        <Field label="Name" v={f["client.name"]} onChange={set("client.name")} required />
        <Field label="Email" type="email" v={f["client.email"]} onChange={set("client.email")} required />
        <Field label="Client Company" v={f["client.company"]} onChange={set("client.company")} />
      </Section>

      <Section title="Proposal">
        <Field label="Title" wide v={f["proposal.title"]} onChange={set("proposal.title")} required />
        <Field label="Proposal #" v={f["proposal.number"]} onChange={set("proposal.number")} required />
        <Field label="Prepared By" v={f["proposal.preparedBy"]} onChange={set("proposal.preparedBy")} />
        <Field label="Date" type="date" v={f["proposal.date"]} onChange={set("proposal.date")} />
        <Field label="Valid Until" type="date" v={f["proposal.validUntil"]} onChange={set("proposal.validUntil")} />
        <Field label="Currency" v={f.currency} onChange={set("currency")} />
      </Section>

      <Section title="Project">
        <Field label="Project Name" v={f["project.name"]} onChange={set("project.name")} required />
        <Textarea label="Brief / Goal (the agent expands this)" v={f["project.summary"]} onChange={set("project.summary")} />
      </Section>

      <Section title="Investment">
        <div className="space-y-3 sm:col-span-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-12">
              <input
                className="sm:col-span-4"
                placeholder="Item (e.g. Website)"
                value={it.name}
                onChange={(e) => updateItem(setItems, i, "name", e.target.value)}
              />
              <input
                className="sm:col-span-3"
                placeholder="Short note (optional)"
                value={it.description}
                onChange={(e) => updateItem(setItems, i, "description", e.target.value)}
              />
              <input
                className="sm:col-span-2"
                placeholder="Qty"
                type="number"
                min="1"
                value={it.quantity}
                onChange={(e) => updateItem(setItems, i, "quantity", e.target.value)}
              />
              <input
                className="sm:col-span-2"
                placeholder="Unit price"
                type="number"
                min="0"
                step="0.01"
                value={it.unitPrice}
                onChange={(e) => updateItem(setItems, i, "unitPrice", e.target.value)}
              />
              <button
                type="button"
                className="h-10 rounded-lg border border-line text-muted hover:text-danger sm:col-span-1"
                onClick={() => setItems((p) => (p.length > 1 ? p.filter((_, j) => j !== i) : p))}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-medium text-accent hover:underline"
            onClick={() => setItems((p) => [...p, emptyItem()])}
          >
            + Add item
          </button>
        </div>
      </Section>

      <Section title="Adjustments">
        <Field label="Discount %" type="number" v={f["discount.value"]} onChange={set("discount.value")} />
        <Field label="Tax %" type="number" v={f["tax.rate"]} onChange={set("tax.rate")} />
        <Textarea label="Terms (optional override)" v={f.terms} onChange={set("terms")} />
        <Textarea label="Notes (optional)" v={f.notes} onChange={set("notes")} />
      </Section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={run.phase === "submitting" || run.phase === "polling"}
          className="rounded-xl bg-brand px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50"
        >
          {run.phase === "submitting" || run.phase === "polling" ? "Generating..." : "Generate & Send Proposal"}
        </button>
        {run.phase === "polling" && <span className="text-sm text-muted">Status: {run.status}</span>}
      </div>

      <Result run={run} />
    </form>
  );
}

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
  const isAdmin = useIsAdmin();
  const m = (v: unknown) => (isAdmin ? "••••" : String(v));
  return (
    <div className="space-y-4 rounded-xl border border-line bg-panel p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium text-brand">
          {o.proposal.title} / {o.proposal.currency} {m(o.summary.total)}
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            o.emailSent ? "bg-brand-50 text-brand-700" : "bg-warn/10 text-warn"
          }`}
        >
          {o.emailSent ? "Emailed" : "PDF ready (email not sent)"}
        </span>
      </div>
      <p className="text-sm text-muted">{o.executiveSummary}</p>
      {o.pdfBase64 && (
        <button
          type="button"
          onClick={() => downloadPdf(o.pdfBase64, o.pdfFilename ?? "proposal.pdf")}
          className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
        >
          Download PDF
        </button>
      )}
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
  wide,
  required,
}: {
  label: string;
  v: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
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

function Textarea({
  label,
  v,
  onChange,
}: {
  label: string;
  v: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <label className="block text-sm sm:col-span-2">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      <textarea
        value={v}
        onChange={onChange}
        rows={3}
        className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

function updateItem(
  setItems: React.Dispatch<React.SetStateAction<Item[]>>,
  i: number,
  key: keyof Item,
  value: string,
) {
  setItems((p) => p.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
}

function trimObj<T extends Record<string, unknown>>(o: T): T {
  return Object.fromEntries(
    Object.entries(o).map(([k, val]) => [k, typeof val === "string" ? val.trim() : val]),
  ) as T;
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

function formatIssues(data: any): string {
  if (data?.issues) return data.issues.map((i: any) => `${i.path}: ${i.message}`).join("\n");
  return data?.error ?? "Request failed";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
