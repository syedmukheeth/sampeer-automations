import type { Category } from "./schema.js";
import { CATEGORIES, type ExpenseInput, type ExpenseReport } from "./schema.js";

/**
 * Round to 2 decimals using integer-cent math to avoid float drift.
 * Half-up rounding. (Same approach as the invoice generator's calc.)
 */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Format a number as a currency string for display (UI/PDF). */
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

/** Whole days in [start, end] inclusive (min 1). */
export function periodDays(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return 1;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export type ExpenseComputed = Omit<
  ExpenseReport,
  "validation" | "report" | "headline" | "insights" | "branding" | "transactions"
> & {
  transactions: ExpenseReport["transactions"];
};

/**
 * Deterministic aggregation. The LLM supplies a category per transaction (same
 * order as input); every number below is computed here, never by the model.
 *
 * `amount` is signed: negative = outflow (spend), positive = inflow (income).
 */
export function computeExpense(
  input: ExpenseInput,
  categories: Category[],
  normalizedMerchants: (string | undefined)[] = [],
): ExpenseComputed {
  const txns = input.transactions.map((t, i) => ({
    date: t.date,
    description: t.description,
    merchant: (normalizedMerchants[i] || t.merchant || t.description).trim(),
    amount: round2(t.amount),
    category: categories[i] ?? ("Other" as Category),
  }));

  let totalSpend = 0;
  let totalIncome = 0;
  for (const t of txns) {
    if (t.amount < 0) totalSpend += -t.amount;
    else totalIncome += t.amount;
  }
  totalSpend = round2(totalSpend);
  totalIncome = round2(totalIncome);
  const net = round2(totalIncome - totalSpend);

  // Per-category spend (outflows only; "Income" rows are inflows so contribute 0 spend).
  const catMap = new Map<Category, { total: number; count: number }>();
  for (const t of txns) {
    const spend = t.amount < 0 ? -t.amount : 0;
    const cur = catMap.get(t.category) ?? { total: 0, count: 0 };
    cur.total += spend;
    cur.count += 1;
    catMap.set(t.category, cur);
  }
  const byCategory = CATEGORIES.map((category) => {
    const v = catMap.get(category) ?? { total: 0, count: 0 };
    return {
      category,
      total: round2(v.total),
      count: v.count,
      pct: totalSpend > 0 ? round2((v.total / totalSpend) * 100) : 0,
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);

  // Top merchants by spend (outflows only).
  const merchMap = new Map<string, { total: number; count: number }>();
  for (const t of txns) {
    if (t.amount >= 0) continue;
    const key = t.merchant || "Unknown";
    const cur = merchMap.get(key) ?? { total: 0, count: 0 };
    cur.total += -t.amount;
    cur.count += 1;
    merchMap.set(key, cur);
  }
  const topMerchants = [...merchMap.entries()]
    .map(([merchant, v]) => ({ merchant, total: round2(v.total), count: v.count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Daily spend buckets across the period (oldest -> newest).
  const days = periodDays(input.report.periodStart, input.report.periodEnd);
  const daily = buildDailySpend(txns, input.report.periodStart, days);

  const dailyBurn = round2(totalSpend / days);
  const monthlyBurn = round2(dailyBurn * 30);

  return {
    summary: {
      totalSpend,
      totalIncome,
      net,
      txnCount: txns.length,
      periodDays: days,
      dailyBurn,
      monthlyBurn,
    },
    byCategory,
    topMerchants,
    daily,
    transactions: txns,
  };
}

/** Per-day spend totals for the chart. Caps at 31 buckets for readability. */
function buildDailySpend(
  txns: { date: string; amount: number }[],
  start: string,
  days: number,
): { label: string; spend: number }[] {
  const span = Math.min(days, 31);
  const startMs = new Date(start).setHours(0, 0, 0, 0);
  const buckets: { label: string; spend: number }[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(startMs);
    d.setDate(d.getDate() + i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    let spend = 0;
    for (const t of txns) {
      if (t.amount >= 0) continue;
      const ts = new Date(t.date).getTime();
      if (ts >= d.getTime() && ts < next.getTime()) spend += -t.amount;
    }
    buckets.push({ label: `${d.getDate()}`, spend: round2(spend) });
  }
  return buckets;
}
