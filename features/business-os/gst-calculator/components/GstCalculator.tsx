"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@shared/lib/cn";
import { useIsAdmin } from "@shared/ui/RoleContext";
import {
  computeTax,
  formatMoney,
  RATE_PRESETS,
  type TaxMode,
  type TaxSplit,
} from "../utils/calc";

export default function GstCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState<TaxMode>("exclusive");
  const [split, setSplit] = useState<TaxSplit>("none");
  const [currency, setCurrency] = useState("INR");
  const [taxName, setTaxName] = useState("GST");

  // Pull default currency from platform settings.
  useEffect(() => {
    let active = true;
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!active || !s?.invoice) return;
        if (s.invoice.defaultCurrency) setCurrency(s.invoice.defaultCurrency);
        if (s.invoice.taxName) setTaxName(s.invoice.taxName);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const input = useMemo(
    () => ({
      amount: Number(amount) || 0,
      rate: Number(rate) || 0,
      mode,
      split,
      currency: currency.trim() || "INR",
      taxName: taxName.trim() || "Tax",
    }),
    [amount, rate, mode, split, currency, taxName],
  );
  const result = useMemo(() => computeTax(input), [input]);
  const isAdmin = useIsAdmin();
  const money = (n: number) => (isAdmin ? "••••" : formatMoney(n, input.currency));

  async function downloadPdf() {
    const { pdf } = await import("@react-pdf/renderer");
    const { GstDocument } = await import("../utils/gst-pdf");
    const blob = await pdf(<GstDocument input={input} result={result} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${input.taxName}-calculation.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      {/* Inputs */}
      <div className="space-y-6 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount">
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="Currency">
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="Tax label">
            <input
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <Field label="Rate %">
            <input
              type="number"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          {RATE_PRESETS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRate(String(r))}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition",
                Number(rate) === r
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-panel text-muted hover:border-brand-500 hover:text-ink",
              )}
            >
              {r}%
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount is">
            <Segmented
              value={mode}
              onChange={(v) => setMode(v as TaxMode)}
              options={[
                { value: "exclusive", label: "Pre-tax" },
                { value: "inclusive", label: "Tax incl." },
              ]}
            />
          </Field>
          <Field label="Split">
            <Segmented
              value={split}
              onChange={(v) => setSplit(v as TaxSplit)}
              options={[
                { value: "none", label: "None" },
                { value: "cgst_sgst", label: "CGST+SGST" },
                { value: "igst", label: "IGST" },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Result */}
      <div className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total {input.mode === "inclusive" ? "(entered)" : "with tax"}</p>
          <p className="tabular mt-1 font-display text-3xl font-medium text-brand">{money(result.total)}</p>
        </div>
        <div className="space-y-2 border-t border-line pt-4 text-sm">
          <Line label="Base amount" value={money(result.base)} />
          {result.cgst > 0 || result.sgst > 0 ? (
            <>
              <Line label={`CGST (${result.rate / 2}%)`} value={money(result.cgst)} />
              <Line label={`SGST (${result.rate / 2}%)`} value={money(result.sgst)} />
            </>
          ) : result.igst > 0 ? (
            <Line label={`IGST (${result.rate}%)`} value={money(result.igst)} />
          ) : (
            <Line label={`${input.taxName} (${result.rate}%)`} value={money(result.taxAmount)} />
          )}
          <Line label="Total tax" value={money(result.taxAmount)} strong />
        </div>
        <button
          type="button"
          onClick={downloadPdf}
          className="w-full rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-stone-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition",
            value === o.value ? "bg-brand text-white shadow-soft" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={cn("tabular", strong ? "font-semibold text-ink" : "text-ink")}>{value}</span>
    </div>
  );
}
