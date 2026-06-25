/**
 * GST / VAT / Sales-tax calculator - pure, deterministic TypeScript.
 * Instant (no background job, no LLM). Used by the client form and the PDF.
 */

export type TaxMode = "exclusive" | "inclusive";
export type TaxSplit = "none" | "cgst_sgst" | "igst";

export interface TaxInput {
  amount: number; // the figure entered
  rate: number; // percent, e.g. 18
  mode: TaxMode; // is `amount` net (exclusive) or gross (inclusive)?
  split: TaxSplit; // India CGST+SGST, IGST, or none (VAT/GST single)
  currency: string;
  taxName?: string; // label e.g. "GST", "VAT"
}

export interface TaxResult {
  base: number; // net amount (pre-tax)
  taxAmount: number; // total tax
  total: number; // gross amount (with tax)
  cgst: number;
  sgst: number;
  igst: number;
  rate: number;
  mode: TaxMode;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeTax(input: TaxInput): TaxResult {
  const amount = Number.isFinite(input.amount) ? input.amount : 0;
  const rate = Number.isFinite(input.rate) ? Math.max(0, input.rate) : 0;

  let base: number;
  let total: number;
  if (input.mode === "inclusive") {
    total = round2(amount);
    base = round2(amount / (1 + rate / 100));
  } else {
    base = round2(amount);
    total = round2(amount * (1 + rate / 100));
  }
  const taxAmount = round2(total - base);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (input.split === "cgst_sgst") {
    cgst = round2(taxAmount / 2);
    sgst = round2(taxAmount - cgst); // absorb rounding remainder
  } else if (input.split === "igst") {
    igst = taxAmount;
  }

  return { base, taxAmount, total, cgst, sgst, igst, rate, mode: input.mode };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

/** Common GST/VAT slabs for quick-select. */
export const RATE_PRESETS = [0, 5, 12, 18, 28] as const;
