import type { JWTPayload } from "jose";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

/**
 * Single-user password auth helpers (stateless session - no database).
 * Edge-safe: uses only `jose`, so `middleware.ts` can import this too.
 */

export const SESSION_COOKIE = "sampeer_session";

const encoder = new TextEncoder();

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return encoder.encode(s);
}

type TokenKind = "session";

/**
 * Two roles share one app:
 * - `owner`  — the founder/CEO. Full access, sees every detail.
 * - `admin`  — operator. Can sign in and edit, but money values are masked
 *              and Settings/secrets are blocked (enforced in middleware).
 */
export type Role = "owner" | "admin";

export type AuthClaims = JWTPayload & { username: string; role: Role; kind: TokenKind };

async function sign(username: string, role: Role, kind: TokenKind, ttl: string): Promise<string> {
  return new SignJWT({ username, role, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

/** Long-lived session token stored in the httpOnly cookie. */
export function signSession(username: string, role: Role): Promise<string> {
  return sign(username, role, "session", "30d");
}

function isRole(v: unknown): v is Role {
  return v === "owner" || v === "admin";
}

/** Verify a token and require a specific kind. Returns claims or null. */
export async function verifyToken(
  token: string | undefined,
  kind: TokenKind,
): Promise<AuthClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (
      payload.kind !== kind ||
      typeof payload.username !== "string" ||
      !isRole(payload.role)
    ) {
      return null;
    }
    return payload as AuthClaims;
  } catch {
    return null;
  }
}

/**
 * Credential verification (constant-time + optional scrypt hashing) lives in
 * `credentials.ts` because it needs node:crypto and must stay out of the edge
 * middleware bundle. This file remains edge-safe (jose only).
 */

/** Claims for any valid session (owner or admin), or null. */
export async function getSessionClaims(token: string | undefined): Promise<AuthClaims | null> {
  return verifyToken(token, "session");
}

/** Any valid session (owner OR admin). Gate for the whole app. */
export async function hasValidSession(token: string | undefined): Promise<boolean> {
  return !!(await getSessionClaims(token));
}

/** A valid session that belongs to the owner specifically. */
export async function hasOwnerSession(token: string | undefined): Promise<boolean> {
  const claims = await getSessionClaims(token);
  return claims?.role === "owner";
}
