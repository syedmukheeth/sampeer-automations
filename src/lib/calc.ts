import type { InvoiceInput } from "./schema.js";

/**
 * Round to 2 decimals using integer-cent math to avoid float drift
 * (e.g. 0.1 + 0.2). Half-up rounding.
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface Totals {
  lineTotals: number[]; // per item, 2dp
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
}

/**
 * Deterministic totals. Order: subtotal -> discount -> tax -> total -> paid -> remaining.
 * The LLM never sees or produces these numbers.
 */
export function computeTotals(input: InvoiceInput): Totals {
  const lineTotals = input.items.map((it) => round2(it.quantity * it.unitPrice));
  const subtotal = round2(lineTotals.reduce((a, b) => a + b, 0));

  let discount = 0;
  if (input.discount) {
    discount =
      input.discount.type === "percent"
        ? round2((subtotal * input.discount.value) / 100)
        : round2(input.discount.value);
  }
  // Discount can never exceed subtotal.
  discount = Math.min(discount, subtotal);

  const taxable = round2(subtotal - discount);
  const tax = input.tax ? round2((taxable * input.tax.rate) / 100) : 0;
  const total = round2(taxable + tax);

  const paid = round2(input.amountPaid ?? 0);
  const remaining = round2(total - paid);

  return { lineTotals, subtotal, discount, tax, total, paid, remaining };
}

/** Format a number as a currency string for display (PDF/email). */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Unknown/non-ISO currency code — fall back to "<CODE> 1,234.00"
    return `${currency} ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
