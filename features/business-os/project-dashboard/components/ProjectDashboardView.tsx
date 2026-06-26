"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Pencil, Trash2, User } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { cn } from "@shared/lib/cn";
import { useIsAdmin } from "@shared/ui/RoleContext";
import { DemoDataButton } from "@shared/ui/DemoDataButton";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectStatus,
} from "../utils/schema";
import { projectFlag, FLAG_LABEL, type ProjectFlag } from "../utils/status";

const FLAG_STYLE: Record<ProjectFlag, string> = {
  delivered: "bg-brand-50 text-brand-700 ring-brand-500/20",
  on_track: "bg-info/10 text-info ring-info/25",
  at_risk: "bg-warn/10 text-warn ring-warn/25",
  overdue: "bg-danger/10 text-danger ring-danger/25",
};

export function ProjectDashboardView({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [currency, setCurrency] = useState("USD");
  const router = useRouter();

  useEffect(() => setProjects(initial), [initial]);
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

  const isAdmin = useIsAdmin();
  const money = (n: number) => (isAdmin ? "••••" : fmtMoney(n, currency));

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status !== "delivered").length;
    const delivered = projects.filter((p) => p.status === "delivered").length;
    const atRisk = projects.filter((p) => {
      const f = projectFlag(p);
      return f === "at_risk" || f === "overdue";
    }).length;
    const value = projects.reduce((a, p) => a + p.value, 0);
    return { active, delivered, atRisk, value };
  }, [projects]);

  async function refresh() {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((p) => p.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <>
    <AutomationPageLayout
      eyebrow="BusinessOS / Clients"
      name="Project Dashboard"
      description="Track every engagement from kickoff to delivery - progress, due dates, and an automatic on-track / at-risk flag."
      icon={Briefcase}
      status="live"
      stats={[
        { label: "Active", value: String(stats.active) },
        { label: "Delivered", value: String(stats.delivered) },
        { label: "At Risk", value: String(stats.atRisk) },
        { label: "Value", value: money(stats.value) },
      ]}
      tabs={[
        {
          id: "projects",
          label: "Projects",
          content: (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <DemoDataButton variant="compact" />
                <button
                  type="button"
                  onClick={() => setEditing("new")}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4" /> Add project
                </button>
              </div>

              {projects.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="h-6 w-6" />}
                  title="No projects yet"
                  description="Add a project to start tracking it from kickoff to delivery."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((p) => {
                    const flag = projectFlag(p);
                    return (
                      <Card key={p.id} className="flex flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-lg font-medium text-ink">{p.name}</h3>
                            {p.client && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                                <User className="h-3.5 w-3.5" /> {p.client}
                              </p>
                            )}
                          </div>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", FLAG_STYLE[flag])}>
                            {FLAG_LABEL[flag]}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span>{PROJECT_STATUS_LABELS[p.status]}</span>
                            <span className="tabular">{p.progress}%</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                            <div className="h-full rounded-full bg-brand" style={{ width: `${p.progress}%` }} />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Value</p>
                            <p className="tabular font-semibold text-ink">{money(p.value)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Due</p>
                            <p className="font-semibold text-ink">{p.dueDate || "-"}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-3">
                          <button type="button" onClick={() => setEditing(p)} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => remove(p.id)} className="ml-auto inline-flex items-center gap-1 text-sm text-muted hover:text-danger">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </Card>
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
              <p className="font-semibold text-ink">Delivery flag</p>
              <p>Deterministic. Delivered when status is delivered or progress is 100%. Overdue when the due date has passed. At risk when actual progress trails the schedule-expected progress by more than 20 points. Otherwise on track.</p>
              <p className="mt-4 font-semibold text-ink">Storage</p>
              <p>Projects persist in the platform kv store (JSON file locally; swap for KV/Redis in production).</p>
            </Card>
          ),
        },
      ]}
    />
      {editing !== null && (
        <ProjectEditor
          project={editing === "new" ? null : editing}
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

function ProjectEditor({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: project?.name ?? "",
    client: project?.client ?? "",
    status: (project?.status ?? "kickoff") as ProjectStatus,
    progress: project?.progress != null ? String(project.progress) : "0",
    startDate: project?.startDate ?? "",
    dueDate: project?.dueDate ?? "",
    value: project?.value ? String(project.value) : "",
    notes: project?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(project?.id ? { id: project.id } : {}),
          name: f.name.trim(),
          client: f.client.trim(),
          status: f.status,
          progress: Math.max(0, Math.min(100, Number(f.progress) || 0)),
          startDate: f.startDate,
          dueDate: f.dueDate,
          value: Number(f.value) || 0,
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
          <h3 className="font-display text-lg font-medium text-ink">{project ? "Edit project" : "Add project"}</h3>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <EField label="Name" v={f.name} onChange={set("name")} required />
          <EField label="Client" v={f.client} onChange={set("client")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Status</span>
            <select value={f.status} onChange={set("status")} className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <EField label="Progress %" type="number" v={f.progress} onChange={set("progress")} />
          <EField label="Start date" type="date" v={f.startDate} onChange={set("startDate")} />
          <EField label="Due date" type="date" v={f.dueDate} onChange={set("dueDate")} />
          <EField label="Value" type="number" v={f.value} onChange={set("value")} />
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
