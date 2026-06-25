"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Plus, Pencil, Trash2, Building2, ArrowRight } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { cn } from "@shared/lib/cn";
import { LEAD_STAGES, type Lead, type LeadStage } from "../utils/schema";
import {
  STAGE_LABEL,
  STAGE_PROBABILITY,
  pipelineSummary,
  weightedValue,
} from "../utils/score";

const STAGE_ACCENT: Record<LeadStage, string> = {
  new: "bg-stone-400",
  contacted: "bg-info",
  qualified: "bg-brand-400",
  proposal: "bg-warn",
  won: "bg-brand-600",
  lost: "bg-danger",
};

export function LeadPipelineView({ initial }: { initial: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initial);
  const [editing, setEditing] = useState<Lead | "new" | null>(null);
  const [currency, setCurrency] = useState("USD");
  const router = useRouter();

  useEffect(() => setLeads(initial), [initial]);
  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => active && s?.invoice?.defaultCurrency && setCurrency(s.invoice.defaultCurrency))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const money = (n: number) => fmtMoney(n, currency);
  const summary = useMemo(() => pipelineSummary(leads), [leads]);
  const byStage = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      new: [], contacted: [], qualified: [], proposal: [], won: [], lost: [],
    };
    for (const l of leads) map[l.stage].push(l);
    return map;
  }, [leads]);

  async function refresh() {
    const res = await fetch("/api/leads");
    if (res.ok) setLeads(await res.json());
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((p) => p.filter((l) => l.id !== id));
    router.refresh();
  }

  return (
    <>
      <AutomationPageLayout
        eyebrow="SalesOS / Pipeline"
        name="Lead Pipeline"
        description="Track every prospect from new to closed - stage, owner, and deal value, with a probability-weighted forecast and win rate computed automatically."
        icon={Target}
        status="live"
        stats={[
          { label: "Open Deals", value: String(summary.open) },
          { label: "Weighted", value: money(summary.weighted) },
          { label: "Won", value: money(summary.wonValue) },
          { label: "Win Rate", value: summary.won + summary.lost > 0 ? `${summary.winRate}%` : "-" },
        ]}
        tabs={[
          {
            id: "board",
            label: "Pipeline",
            content: (
              <div className="space-y-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditing("new")}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                  >
                    <Plus className="h-4 w-4" /> Add lead
                  </button>
                </div>

                {leads.length === 0 ? (
                  <EmptyState
                    icon={<Target className="h-6 w-6" />}
                    title="No leads yet"
                    description="Add your first lead to start forecasting the pipeline."
                  />
                ) : (
                  <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
                    {LEAD_STAGES.map((stage) => {
                      const items = byStage[stage];
                      const stageValue = items.reduce((a, l) => a + l.value, 0);
                      return (
                        <div key={stage} className="flex flex-col rounded-2xl border border-line/80 bg-stone-50/60 p-3">
                          <div className="mb-3 flex items-center justify-between gap-2 px-1">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                              <span className={cn("h-2 w-2 rounded-full", STAGE_ACCENT[stage])} />
                              {STAGE_LABEL[stage]}
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-muted ring-1 ring-inset ring-line">
                              {items.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {items.map((l) => (
                              <div key={l.id} className="group rounded-xl border border-line bg-panel p-3 shadow-soft transition hover:border-brand-500/40 hover:shadow-lift">
                                <p className="truncate text-sm font-semibold text-ink">{l.name}</p>
                                {l.company && (
                                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                                    <Building2 className="h-3 w-3" /> {l.company}
                                  </p>
                                )}
                                <p className="tabular mt-2 text-sm font-semibold text-brand">{money(l.value)}</p>
                                {stage !== "won" && stage !== "lost" && (
                                  <p className="text-[11px] text-muted">
                                    forecast {money(weightedValue(l))} · {Math.round(STAGE_PROBABILITY[stage] * 100)}%
                                  </p>
                                )}
                                {l.nextStep && (
                                  <p className="mt-2 flex items-start gap-1 text-[11px] text-muted">
                                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" /> {l.nextStep}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-2 border-t border-line/60 pt-2 opacity-0 transition group-hover:opacity-100">
                                  <button type="button" onClick={() => setEditing(l)} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                                    <Pencil className="h-3 w-3" /> Edit
                                  </button>
                                  <button type="button" onClick={() => remove(l.id)} className="ml-auto inline-flex items-center gap-1 text-xs text-muted hover:text-danger">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {items.length === 0 && (
                              <p className="px-1 py-3 text-center text-xs text-muted/70">Empty</p>
                            )}
                          </div>
                          {stageValue > 0 && (
                            <p className="mt-2 px-1 text-[11px] font-medium text-muted">{money(stageValue)} total</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "docs",
            label: "Documentation",
            content: (
              <Card className="prose-sm max-w-none p-6 text-sm leading-relaxed text-muted">
                <p className="font-semibold text-ink">Weighted forecast</p>
                <p>Each open stage carries a win probability (New 10%, Contacted 25%, Qualified 50%, Proposal 70%). Weighted value = deal value x probability, summed across open deals - your realistic forecast.</p>
                <p className="mt-4 font-semibold text-ink">Win rate</p>
                <p>Closed outcomes only: won ÷ (won + lost). Open deals don't count until they close either way.</p>
                <p className="mt-4 font-semibold text-ink">Storage</p>
                <p>Leads persist in the platform kv store (JSON file locally; swap for KV/Redis in production). Single-workspace.</p>
              </Card>
            ),
          },
        ]}
      />
      {editing !== null && (
        <LeadEditor
          lead={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await refresh();
          }}
        />
      )}
    </>
  );
}

/* ------------------------------ editor modal ------------------------------ */

function LeadEditor({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: lead?.name ?? "",
    company: lead?.company ?? "",
    email: lead?.email ?? "",
    source: lead?.source ?? "",
    owner: lead?.owner ?? "",
    stage: (lead?.stage ?? "new") as LeadStage,
    value: lead?.value ? String(lead.value) : "",
    nextStep: lead?.nextStep ?? "",
    lastActivity: lead?.lastActivity ?? "",
    notes: lead?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(lead?.id ? { id: lead.id } : {}),
          name: f.name.trim(),
          company: f.company.trim(),
          email: f.email.trim(),
          source: f.source.trim(),
          owner: f.owner.trim(),
          stage: f.stage,
          value: Number(f.value) || 0,
          nextStep: f.nextStep.trim(),
          lastActivity: f.lastActivity,
          notes: f.notes.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.detail ?? d.error ?? "Failed to save");
        return;
      }
      onSaved();
    } catch (e) {
      setErr(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-panel shadow-lift">
        <div className="border-b border-line px-6 py-4">
          <h3 className="font-display text-lg font-medium text-ink">{lead ? "Edit lead" : "Add lead"}</h3>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <EField label="Name" v={f.name} onChange={set("name")} required />
          <EField label="Company" v={f.company} onChange={set("company")} />
          <EField label="Email" v={f.email} onChange={set("email")} />
          <EField label="Source" v={f.source} onChange={set("source")} />
          <EField label="Owner" v={f.owner} onChange={set("owner")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Stage</span>
            <select value={f.stage} onChange={set("stage")} className="w-full rounded-lg border border-line px-3 py-2 capitalize focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {LEAD_STAGES.map((s) => (
                <option key={s} value={s} className="capitalize">{STAGE_LABEL[s]}</option>
              ))}
            </select>
          </label>
          <EField label="Deal value" type="number" v={f.value} onChange={set("value")} />
          <EField label="Last activity" type="date" v={f.lastActivity} onChange={set("lastActivity")} />
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-ink">Next step</span>
            <input value={f.nextStep} onChange={set("nextStep")} className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-ink">Notes</span>
            <textarea value={f.notes} onChange={set("notes")} className="h-20 w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </label>
          {err && <p className="text-sm text-danger sm:col-span-2">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:text-ink">Cancel</button>
          <button type="button" onClick={save} disabled={saving || !f.name.trim()} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EField({
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
      <input type={type} value={v} onChange={onChange} className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
    </label>
  );
}

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}
