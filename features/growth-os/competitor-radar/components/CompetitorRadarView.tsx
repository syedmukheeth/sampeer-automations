"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { DemoDataButton } from "@shared/ui/DemoDataButton";
import { cn } from "@shared/lib/cn";
import { THREAT_LEVELS, type Competitor, type ThreatLevel } from "../utils/schema";
import { THREAT_LABEL, radarSummary, sortByThreat } from "../utils/score";

const THREAT_STYLE: Record<ThreatLevel, string> = {
  high: "bg-danger/10 text-danger ring-danger/25",
  medium: "bg-warn/10 text-warn ring-warn/25",
  low: "bg-brand-50 text-brand-700 ring-brand-500/20",
};

export function CompetitorRadarView({ initial }: { initial: Competitor[] }) {
  const [items, setItems] = useState<Competitor[]>(initial);
  const [editing, setEditing] = useState<Competitor | "new" | null>(null);
  const router = useRouter();

  useEffect(() => setItems(initial), [initial]);

  const summary = useMemo(() => radarSummary(items), [items]);
  const sorted = useMemo(() => sortByThreat(items), [items]);

  async function refresh() {
    const res = await fetch("/api/competitors");
    if (res.ok) setItems(await res.json());
    router.refresh();
  }
  async function remove(id: string) {
    await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <>
      <AutomationPageLayout
        eyebrow="GrowthOS / Insight"
        name="Competitor Radar"
        description="Track every rival in one place - positioning, pricing, strengths, and a threat level - with an automatic threat index across your whole landscape."
        icon={Globe}
        status="live"
        stats={[
          { label: "Tracked", value: String(summary.total) },
          { label: "High threat", value: String(summary.high) },
          { label: "Threat index", value: summary.total ? `${summary.threatIndex}` : "-" },
          { label: "Med / Low", value: `${summary.medium} / ${summary.low}` },
        ]}
        tabs={[
          {
            id: "radar",
            label: "Radar",
            content: (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <DemoDataButton variant="compact" resource="competitors" />
                  <button
                    type="button"
                    onClick={() => setEditing("new")}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                  >
                    <Plus className="h-4 w-4" /> Add competitor
                  </button>
                </div>

                {items.length === 0 ? (
                  <EmptyState
                    icon={<Globe className="h-6 w-6" />}
                    title="No competitors tracked"
                    description="Add your first rival to start mapping the landscape."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {sorted.map((c) => (
                      <Card key={c.id} className="flex flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-lg font-medium text-ink">{c.name}</h3>
                            {c.url && (
                              <a href={normalizeUrl(c.url)} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-xs text-info hover:underline">
                                <ExternalLink className="h-3 w-3" /> {c.url}
                              </a>
                            )}
                          </div>
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", THREAT_STYLE[c.threat])}>
                            {THREAT_LABEL[c.threat]}
                          </span>
                        </div>

                        {c.positioning && <p className="mt-3 text-sm text-muted">{c.positioning}</p>}

                        <div className="mt-3 space-y-1.5 text-xs">
                          {c.pricing && <Row label="Pricing" value={c.pricing} />}
                          {c.strengths && <Row label="Strengths" value={c.strengths} />}
                          {c.weaknesses && <Row label="Weaknesses" value={c.weaknesses} />}
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-3">
                          <button type="button" onClick={() => setEditing(c)} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => remove(c.id)} className="ml-auto inline-flex items-center gap-1 text-sm text-muted hover:text-danger">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </Card>
                    ))}
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
                <p className="font-semibold text-ink">Threat index</p>
                <p>Each competitor carries a threat level (Low/Medium/High → weight 1/2/3). The index is the average weight normalized to 0-100, so you see how hot your overall landscape is at a glance.</p>
                <p className="mt-4 font-semibold text-ink">Storage</p>
                <p>Competitors persist in the platform kv store (JSON file locally; swap for KV/Redis in production). Single-workspace.</p>
                <p className="mt-4 font-semibold text-ink">Upgrade path</p>
                <p>A live-data upgrade can auto-fetch pricing pages and rank changes to flag competitor moves automatically.</p>
              </Card>
            ),
          },
        ]}
      />
      {editing !== null && (
        <CompetitorEditor
          competitor={editing === "new" ? null : editing}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-muted">
      <span className="font-semibold text-ink">{label}:</span> {value}
    </p>
  );
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/* ------------------------------ editor modal ------------------------------ */

function CompetitorEditor({
  competitor,
  onClose,
  onSaved,
}: {
  competitor: Competitor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: competitor?.name ?? "",
    url: competitor?.url ?? "",
    pricing: competitor?.pricing ?? "",
    positioning: competitor?.positioning ?? "",
    strengths: competitor?.strengths ?? "",
    weaknesses: competitor?.weaknesses ?? "",
    threat: (competitor?.threat ?? "medium") as ThreatLevel,
    notes: competitor?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(competitor?.id ? { id: competitor.id } : {}),
          name: f.name.trim(),
          url: f.url.trim(),
          pricing: f.pricing.trim(),
          positioning: f.positioning.trim(),
          strengths: f.strengths.trim(),
          weaknesses: f.weaknesses.trim(),
          threat: f.threat,
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
          <h3 className="font-display text-lg font-medium text-ink">{competitor ? "Edit competitor" : "Add competitor"}</h3>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <EField label="Name" v={f.name} onChange={set("name")} required />
          <EField label="Website" v={f.url} onChange={set("url")} />
          <EField label="Pricing" v={f.pricing} onChange={set("pricing")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Threat</span>
            <select value={f.threat} onChange={set("threat")} className="w-full rounded-lg border border-line px-3 py-2 capitalize focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {THREAT_LEVELS.map((t) => (
                <option key={t} value={t} className="capitalize">{THREAT_LABEL[t]}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-ink">Positioning</span>
            <input value={f.positioning} onChange={set("positioning")} className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </label>
          <EField label="Strengths" v={f.strengths} onChange={set("strengths")} />
          <EField label="Weaknesses" v={f.weaknesses} onChange={set("weaknesses")} />
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
  required,
}: {
  label: string;
  v: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input value={v} onChange={onChange} className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
    </label>
  );
}
