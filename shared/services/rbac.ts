import "server-only";
import { currentSession } from "./session";

/**
 * Role-based access helpers for API routes (nodejs runtime).
 *
 * The admin role may operate the dashboard but must not read studio money
 * values — and client masking is not enough because the raw JSON still travels
 * over the API. These helpers let GET routes redact money fields server-side
 * before the response leaves the server.
 */

/** True when the current request is authenticated as the limited admin. */
export async function isAdminRequest(): Promise<boolean> {
  const s = await currentSession();
  return s?.role === "admin";
}

/**
 * Zero out the given numeric money keys on every row when the caller is admin.
 * Owner gets untouched data. Non-money fields are always preserved.
 */
export async function redactMoneyForAdmin<T extends Record<string, unknown>>(
  rows: T[],
  moneyKeys: (keyof T)[],
): Promise<T[]> {
  if (!(await isAdminRequest())) return rows;
  return rows.map((row) => {
    const copy = { ...row };
    for (const k of moneyKeys) {
      const v = copy[k];
      // Numbers -> 0; free-text money (e.g. "$49/mo") -> redaction marker.
      copy[k] = (typeof v === "number" ? 0 : "•••") as T[keyof T];
    }
    return copy;
  });
}
