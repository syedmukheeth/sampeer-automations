"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, FileDown, Trophy } from "lucide-react";
import { cn } from "@shared/lib/cn";
import { useIsAdmin } from "@shared/ui/RoleContext";
import { DemoFillButton } from "@shared/ui/DemoFillButton";
import {
  blended,
  bestChannel,
  channelMetrics,
  type ChannelRow,
} from "../utils/calc";

const SEED: ChannelRow[] = [
  { id: "r1", channel: "Google Ads", spend: 4000, leads: 220, customers: 38, revenue: 19000 },
  { id: "r2", channel: "LinkedIn", spend: 2500, leads: 90, customers: 14, revenue: 11200 },
  { id: "r3", channel: "Cold Email", spend: 600, leads: 140, customers: 22, revenue: 13200 },
];

const newRow = (): ChannelRow => ({
  id: `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  channel: "",
  spend: 0,
  leads: 0,
  customers: 0,
  revenue: 0,
});

export default function GrowthAnalytics() {
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [currency, setCurrency] = useState("USD");

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
  const money = (n: number) => (isAdmin ? "••••" : fmt(n, currency));
  const summary = useMemo(() => blended(rows), [rows]);
  const best = useMemo(() => bestChannel(rows), [rows]);
  const maxRevenue = useMemo(() => Math.max(1, ...rows.map((r) => r.revenue)), [rows]);

  const update = (id: string, patch: Partial<ChannelRow>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const num = (v: string) => Math.max(0, Number(v) || 0);

  async function downloadPdf() {
    const { pdf } = await import("@react-pdf/renderer");
    const { AnalyticsDocument } = await import("../utils/analytics-pdf");
    const blob = await pdf(<AnalyticsDocument rows={rows} currency={currency} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "growth-analytics.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <DemoFillButton onLoad={() => setRows(SEED)} onClear={() => setRows([])} />
      </div>
      {/* Blended KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Spend" value={money(summary.spend)} />
        <Kpi label="Revenue" value={money(summary.revenue)} />
        <Kpi label="Customers" value={String(summary.customers)} />
        <Kpi label="Blended CAC" value={money(summary.cac)} />
        <Kpi label="ROAS" value={`${summary.roas}x`} tone={summary.roas >= 1 ? "good" : "bad"} />
        <Kpi label="ROI" value={`${summary.roi}%`} tone={summary.roi >= 0 ? "good" : "bad"} />
      </div>

      {/* Editable channel table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-stone-50/70 text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Channel</th>
                <th className="px-4 py-3 text-right font-semibold">Spend</th>
                <th className="px-4 py-3 text-right font-semibold">Leads</th>
                <th className="px-4 py-3 text-right font-semibold">Customers</th>
                <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                <th className="px-4 py-3 text-right font-semibold">CAC</th>
                <th className="px-4 py-3 text-right font-semibold">ROAS</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const m = channelMetrics(r);
                return (
                  <tr key={r.id} className="border-b border-line/70 last:border-b-0">
                    <td className="px-4 py-2">
                      <input
                        value={r.channel}
                        onChange={(e) => update(r.id, { channel: e.target.value })}
                        placeholder="Channel"
                        className="w-40 rounded-lg border border-line px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                    <NumCell value={r.spend} onChange={(v) => update(r.id, { spend: num(v) })} />
                    <NumCell value={r.leads} onChange={(v) => update(r.id, { leads: num(v) })} />
                    <NumCell value={r.customers} onChange={(v) => update(r.id, { customers: num(v) })} />
                    <NumCell value={r.revenue} onChange={(v) => update(r.id, { revenue: num(v) })} />
                    <td className="px-4 py-2 text-right tabular text-muted">{money(m.cac)}</td>
                    <td className={cn("px-4 py-2 text-right tabular font-semibold", m.roas >= 1 ? "text-success" : "text-danger")}>{m.roas}x</td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}
                        className="text-muted transition hover:text-danger"
                        aria-label="Remove channel"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={() => setRows((p) => [...p, newRow()])}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-muted transition hover:border-brand-500 hover:text-brand"
          >
            <Plus className="h-4 w-4" /> Add channel
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand-50"
          >
            <FileDown className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Revenue by channel viz */}
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-soft">
          <h3 className="text-sm font-semibold text-ink">Revenue by channel</h3>
          <div className="mt-4 space-y-3">
            {rows.map((r) => (
              <div key={r.id}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">{r.channel || "Untitled"}</span>
                  <span className="tabular font-medium text-ink">{money(r.revenue)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-500"
                    style={{ width: `${Math.round((r.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted">Add a channel to see the breakdown.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-6 shadow-soft">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Trophy className="h-4 w-4 text-accent" /> Top channel
          </h3>
          {best ? (
            <div className="mt-3">
              <p className="font-display text-2xl font-medium text-brand">{best.channel || "Untitled"}</p>
              <p className="mt-1 text-sm text-muted">
                {channelMetrics(best).roas}x ROAS · {money(channelMetrics(best).profit)} profit
              </p>
              <p className="mt-3 text-xs text-muted">Highest return on ad spend across your channels.</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Enter spend to rank your channels.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p
        className={cn(
          "tabular mt-2 text-xl font-semibold tracking-tight",
          tone === "good" ? "text-success" : tone === "bad" ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function NumCell({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <td className="px-4 py-2 text-right">
      <input
        type="number"
        inputMode="decimal"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-24 rounded-lg border border-line px-2.5 py-1.5 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </td>
  );
}

function fmt(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}
