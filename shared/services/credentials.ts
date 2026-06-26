import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import type { Role } from "./auth";

/**
 * Server-only credential verification (nodejs runtime — never imported by
 * middleware/edge). Supports two storage modes per role:
 *
 *   1. Hashed (recommended):  AUTH_PASSWORD_HASH = scrypt$<saltHex>$<hashHex>
 *      Generate with:  node scripts/hash-password.mjs '<password>'
 *   2. Plaintext (dev/simple): AUTH_PASSWORD = <password>
 *
 * Owner is always checked before admin. All comparisons are constant-time to
 * avoid leaking length/content via timing.
 */

type Cred = { role: Role; username?: string; password?: string; hash?: string };

function configuredCreds(): Cred[] {
  return [
    {
      role: "owner",
      username: process.env.AUTH_USERNAME,
      password: process.env.AUTH_PASSWORD,
      hash: process.env.AUTH_PASSWORD_HASH,
    },
    {
      role: "admin",
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      hash: process.env.ADMIN_PASSWORD_HASH,
    },
  ];
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) {
    // Compare against self so the work (and timing) is independent of a match.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

function verifyHash(password: string, stored: string): boolean {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** Resolve a login attempt to its role, or null. Owner wins on any collision. */
export function verifyLogin(username: string, password: string): Role | null {
  const u = username.trim();
  for (const c of configuredCreds()) {
    const cu = (c.username ?? "").trim();
    if (!cu || cu !== u) continue;
    if (c.hash && verifyHash(password, c.hash)) return c.role;
    if (c.password && c.password.length > 0 && constantTimeEqual(password, c.password)) {
      return c.role;
    }
  }
  return null;
}
