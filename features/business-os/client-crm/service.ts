import { kvGet, kvSet } from "@shared/services/store";
import { clientInputSchema, clientSchema, type Client } from "./utils/schema";

/**
 * Client CRM store. Backed by the platform kv adapter (JSON file locally; swap
 * for KV/Redis in prod). Single-workspace; key by tenant id to go multi-tenant.
 * Server-only.
 */

const KEY = "crm-clients";

export async function listClients(): Promise<Client[]> {
  const raw = (await kvGet<Client[]>(KEY)) ?? [];
  // Parse each through the schema so older/partial records get defaults filled.
  return raw
    .map((c) => clientSchema.safeParse(c))
    .filter((r): r is { success: true; data: Client } => r.success)
    .map((r) => r.data)
    .sort((a, b) => b.value - a.value);
}

/** Create (no id) or update (id present). Returns the saved client + persisted flag. */
export async function saveClient(
  input: unknown,
): Promise<{ client: Client; persisted: boolean }> {
  const parsed = clientInputSchema.parse(input);
  const clients = await listClients();

  let client: Client;
  if (parsed.id) {
    const existing = clients.find((c) => c.id === parsed.id);
    client = clientSchema.parse({
      ...(existing ?? { createdAt: new Date().toISOString() }),
      ...parsed,
      id: parsed.id,
    });
  } else {
    client = clientSchema.parse({
      ...parsed,
      id: cryptoId(),
      createdAt: new Date().toISOString(),
    });
  }

  const next = parsed.id
    ? clients.map((c) => (c.id === client.id ? client : c))
    : [...clients, client];
  if (parsed.id && !next.some((c) => c.id === client.id)) next.push(client);

  const persisted = await kvSet(KEY, next);
  return { client, persisted };
}

export async function deleteClient(id: string): Promise<boolean> {
  const clients = await listClients();
  return kvSet(KEY, clients.filter((c) => c.id !== id));
}

function cryptoId(): string {
  return `cl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
