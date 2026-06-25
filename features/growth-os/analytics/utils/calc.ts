/**
 * Growth analytics - pure, deterministic TypeScript. Instant (no LLM, no job).
 * Per-channel acquisition economics plus a blended roll-up. Every figure is a
 * guarded division so empty rows never produce NaN/Infinity.
 */

export interface ChannelRow {
  id: string;
  channel: string;
  spend: number;
  leads: number;
  customers: number;
  revenue: number;
}

export interface ChannelMetrics {
  cpl: number; // cost per lead
  cac: number; // cost per acquired customer
  conversion: number; // leads -> customers, percent
  roas: number; // revenue / spend
  profit: number; // revenue - spend
}

export interface BlendedMetrics {
  spend: number;
  leads: number;
  customers: number;
  revenue: number;
  cac: number;
  cpl: number;
  conversion: number;
  roas: number;
  profit: number;
  roi: number; // profit / spend, percent
}

function div(a: number, b: number): number {
  return b > 0 ? a / b : 0;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function channelMetrics(row: ChannelRow): ChannelMetrics {
  return {
    cpl: round2(div(row.spend, row.leads)),
    cac: round2(div(row.spend, row.customers)),
    conversion: round2(div(row.customers, row.leads) * 100),
    roas: round2(div(row.revenue, row.spend)),
    profit: round2(row.revenue - row.spend),
  };
}

export function blended(rows: ChannelRow[]): BlendedMetrics {
  const spend = rows.reduce((a, r) => a + r.spend, 0);
  const leads = rows.reduce((a, r) => a + r.leads, 0);
  const customers = rows.reduce((a, r) => a + r.customers, 0);
  const revenue = rows.reduce((a, r) => a + r.revenue, 0);
  const profit = revenue - spend;

  return {
    spend: round2(spend),
    leads,
    customers,
    revenue: round2(revenue),
    cac: round2(div(spend, customers)),
    cpl: round2(div(spend, leads)),
    conversion: round2(div(customers, leads) * 100),
    roas: round2(div(revenue, spend)),
    profit: round2(profit),
    roi: round2(div(profit, spend) * 100),
  };
}

/** Best channel by ROAS (ties broken by profit). Null when no spend anywhere. */
export function bestChannel(rows: ChannelRow[]): ChannelRow | null {
  const eligible = rows.filter((r) => r.spend > 0);
  if (eligible.length === 0) return null;
  return eligible
    .slice()
    .sort((a, b) => {
      const ra = channelMetrics(a).roas;
      const rb = channelMetrics(b).roas;
      if (rb !== ra) return rb - ra;
      return channelMetrics(b).profit - channelMetrics(a).profit;
    })[0];
}
