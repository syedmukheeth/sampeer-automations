"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Pencil, Trash2, Building2, Mail, Phone } from "lucide-react";
import { Card } from "@shared/ui/Card";
import { EmptyState } from "@shared/ui/EmptyState";
import { AutomationPageLayout } from "@shared/ui/AutomationPageLayout";
import { cn } from "@shared/lib/cn";
import { useIsAdmin } from "@shared/ui/RoleContext";
import { DemoDataButton } from "@shared/ui/DemoDataButton";
import {
  CLIENT_STATUSES,
  type Client,
  type ClientStatus,
} from "../utils/schema";
import { clientHealth, type HealthLabel } from "../utils/health";

const STATUS_STYLE: Record<ClientStatus, string> = {
  active: "bg-brand-50 text-brand-700 ring-brand-500/20",
  lead: "bg-warn/10 text-warn ring-warn/25",
  paused: "bg-stone-100 text-stone-600 ring-stone-400/30",
  churned: "bg-danger/10 text-danger ring-danger/25",
};

const HEALTH_STYLE: Record<HealthLabel, string> = {
  Healthy: "text-brand-700",
  Steady: "text-info",
  "At risk": "text-warn",
  Critical: "text-danger",
};

export function ClientCrmView({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [editing, setEditing] = useState<Client | "new" | null>(null);
  const [currency, setCurrency] = useState("USD");
  const router = useRouter();

  useEffect(() => setClients(initial), [initial]);
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
    const active = clients.filter((c) => c.status === "active").length;
    const pipeline = clients.reduce((a, c) => a + c.value, 0);
    const avgHealth = clients.length
      ? Math.round(clients.reduce((a, c) => a + clientHealth(c).score, 0) / clients.length)
      : 0;
    return { total: clients.length, active, pipeline, avgHealth };
  }, [clients]);

  async function refresh() {
    const res = await fetch("/api/clients");
    if (res.ok) setClients(await res.json());
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    setClients((p) => p.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <>
    <AutomationPageLayout
      eyebrow="BusinessOS / Clients"
      name="Client CRM"
      description="A relationship hub for every client - status, account value, last contact, and an at-a-glance health score."
      icon={Users}
      status="live"
      stats={[
        { label: "Clients", value: String(stats.total) },
        { label: "Active", value: String(stats.active) },
        { label: "Pipeline", value: money(stats.pipeline) },
        { label: "Avg Health", value: stats.total ? `${stats.avgHealth}` : "-" },
      ]}
      tabs={[
        {
          id: "clients",
          label: "Clients",
          content: (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <DemoDataButton variant="compact" />
                <button
                  type="button"
                  onClick={() => setEditing("new")}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4" /> Add client
                </button>
              </div>

              {clients.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No clients yet"
                  description="Add your first client to start tracking the relationship."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {clients.map((c) => {
                    const h = clientHealth(c);
                    return (
                      <Card key={c.id} className="flex flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-display text-lg font-medium text-ink">{c.name}</h3>
                            {c.company && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted">
                                <Building2 className="h-3.5 w-3.5" /> {c.company}
                              </p>
                            )}
                          </div>
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", STATUS_STYLE[c.status])}>
                            {c.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Value</p>
                            <p className="tabular font-semibold text-ink">{money(c.value)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Health</p>
                            <p className={cn("font-semibold", HEALTH_STYLE[h.label])}>{h.score} · {h.label}</p>
                          </div>
                        </div>

                        {(c.email || c.phone) && (
                          <div className="mt-3 space-y-1 text-xs text-muted">
                            {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3" />{c.email}</p>}
                            {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{c.phone}</p>}
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2 border-t border-line/70 pt-3">
                          <button type="button" onClick={() => setEditing(c)} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button type="button" onClick={() => remove(c.id)} className="ml-auto inline-flex items-center gap-1 text-sm text-muted hover:text-danger">
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
              <p className="font-semibold text-ink">Health score</p>
              <p>A deterministic 0-100 score from the client status plus how recently you logged contact. Healthy ≥ 75, Steady ≥ 50, At risk ≥ 30, otherwise Critical.</p>
              <p className="mt-4 font-semibold text-ink">Storage</p>
              <p>Clients persist in the platform kv store (JSON file locally; swap for KV/Redis in production). Single-workspace.</p>
            </Card>
          ),
        },
      ]}
    />
      {editing !== null && (
        <ClientEditor
          client={editing === "new" ? null : editing}
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

function ClientEditor({
  client,
  onClose,
  onSaved,
}: {
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState({
    name: client?.name ?? "",
    company: client?.company ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    status: (client?.status ?? "lead") as ClientStatus,
    value: client?.value ? String(client.value) : "",
    lastContact: client?.lastContact ?? "",
    notes: client?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(client?.id ? { id: client.id } : {}),
          name: f.name.trim(),
          company: f.company.trim(),
          email: f.email.trim(),
          phone: f.phone.trim(),
          status: f.status,
          value: Number(f.value) || 0,
          lastContact: f.lastContact,
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
          <h3 className="font-display text-lg font-medium text-ink">{client ? "Edit client" : "Add client"}</h3>
        </div>
        <div className="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <EField label="Name" v={f.name} onChange={set("name")} required />
          <EField label="Company" v={f.company} onChange={set("company")} />
          <EField label="Email" v={f.email} onChange={set("email")} />
          <EField label="Phone" v={f.phone} onChange={set("phone")} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Status</span>
            <select value={f.status} onChange={set("status")} className="w-full rounded-lg border border-line px-3 py-2 capitalize focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </label>
          <EField label="Account value" type="number" v={f.value} onChange={set("value")} />
          <EField label="Last contact" type="date" v={f.lastContact} onChange={set("lastContact")} />
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
