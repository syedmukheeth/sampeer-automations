import "server-only";
import { kvGet, kvSet } from "./store";
import { currentSession } from "./session";

/**
 * Lightweight append-only audit trail for state changes. Records who (role +
 * username) did what (action + resource). Capped to the most recent MAX entries
 * in the kv store. Never throws into the request path — audit failures are
 * swallowed so they can't break a write.
 */

const KEY = "audit-log";
const MAX = 500;

export type AuditEntry = {
  at: string; // ISO timestamp
  role: string;
  user: string;
  action: "create" | "update" | "delete";
  resource: string;
  id?: string;
};

export async function logAudit(
  action: AuditEntry["action"],
  resource: string,
  id?: string,
): Promise<void> {
  try {
    const s = await currentSession();
    const entry: AuditEntry = {
      at: new Date().toISOString(),
      role: s?.role ?? "unknown",
      user: s?.username ?? "unknown",
      action,
      resource,
      id,
    };
    const log = (await kvGet<AuditEntry[]>(KEY)) ?? [];
    log.push(entry);
    await kvSet(KEY, log.slice(-MAX));
  } catch {
    /* audit must never block a request */
  }
}

/** Most-recent-first audit entries. */
export async function readAudit(limit = 50): Promise<AuditEntry[]> {
  const log = (await kvGet<AuditEntry[]>(KEY)) ?? [];
  return log.slice(-limit).reverse();
}
