import { kvGet, kvSet } from "@shared/services/store";
import { competitorInputSchema, competitorSchema, type Competitor } from "./utils/schema";

/**
 * Competitor radar store. Backed by the platform kv adapter (JSON file locally;
 * swap for KV/Redis in prod). Single-workspace; key by tenant id to go
 * multi-tenant. Server-only.
 */

const KEY = "competitors";

export async function listCompetitors(): Promise<Competitor[]> {
  const raw = (await kvGet<Competitor[]>(KEY)) ?? [];
  return raw
    .map((c) => competitorSchema.safeParse(c))
    .filter((r): r is { success: true; data: Competitor } => r.success)
    .map((r) => r.data);
}

/** Create (no id) or update (id present). Returns the saved record + persisted flag. */
export async function saveCompetitor(
  input: unknown,
): Promise<{ competitor: Competitor; persisted: boolean }> {
  const parsed = competitorInputSchema.parse(input);
  const list = await listCompetitors();

  let competitor: Competitor;
  if (parsed.id) {
    const existing = list.find((c) => c.id === parsed.id);
    competitor = competitorSchema.parse({
      ...(existing ?? { createdAt: new Date().toISOString() }),
      ...parsed,
      id: parsed.id,
    });
  } else {
    competitor = competitorSchema.parse({
      ...parsed,
      id: cryptoId(),
      createdAt: new Date().toISOString(),
    });
  }

  const next = parsed.id
    ? list.map((c) => (c.id === competitor.id ? competitor : c))
    : [...list, competitor];
  if (parsed.id && !next.some((c) => c.id === competitor.id)) next.push(competitor);

  const persisted = await kvSet(KEY, next);
  return { competitor, persisted };
}

export async function deleteCompetitor(id: string): Promise<boolean> {
  const list = await listCompetitors();
  return kvSet(KEY, list.filter((c) => c.id !== id));
}

function cryptoId(): string {
  return `cmp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
