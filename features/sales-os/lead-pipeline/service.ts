import { kvGet, kvSet } from "@shared/services/store";
import { leadInputSchema, leadSchema, type Lead } from "./utils/schema";

/**
 * Lead pipeline store. Backed by the platform kv adapter (JSON file locally;
 * swap for KV/Redis in prod). Single-workspace; key by tenant id to go
 * multi-tenant. Server-only.
 */

const KEY = "sales-leads";

export async function listLeads(): Promise<Lead[]> {
  const raw = (await kvGet<Lead[]>(KEY)) ?? [];
  return raw
    .map((l) => leadSchema.safeParse(l))
    .filter((r): r is { success: true; data: Lead } => r.success)
    .map((r) => r.data)
    .sort((a, b) => b.value - a.value);
}

/** Create (no id) or update (id present). Returns the saved lead + persisted flag. */
export async function saveLead(
  input: unknown,
): Promise<{ lead: Lead; persisted: boolean }> {
  const parsed = leadInputSchema.parse(input);
  const leads = await listLeads();

  let lead: Lead;
  if (parsed.id) {
    const existing = leads.find((l) => l.id === parsed.id);
    lead = leadSchema.parse({
      ...(existing ?? { createdAt: new Date().toISOString() }),
      ...parsed,
      id: parsed.id,
    });
  } else {
    lead = leadSchema.parse({
      ...parsed,
      id: cryptoId(),
      createdAt: new Date().toISOString(),
    });
  }

  const next = parsed.id
    ? leads.map((l) => (l.id === lead.id ? lead : l))
    : [...leads, lead];
  if (parsed.id && !next.some((l) => l.id === lead.id)) next.push(lead);

  const persisted = await kvSet(KEY, next);
  return { lead, persisted };
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await listLeads();
  return kvSet(KEY, leads.filter((l) => l.id !== id));
}

function cryptoId(): string {
  return `ld_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
