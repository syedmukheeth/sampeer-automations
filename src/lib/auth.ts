import type { JWTPayload } from "jose";
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

/**
 * Single-user magic-link auth helpers (stateless — no database).
 * Edge-safe: uses only `jose`, so `middleware.ts` can import this too.
 */

export const SESSION_COOKIE = "sampeer_session";

const encoder = new TextEncoder();

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return encoder.encode(s);
}

type TokenKind = "magic" | "session";

export type AuthClaims = JWTPayload & { email: string; kind: TokenKind };

async function sign(email: string, kind: TokenKind, ttl: string): Promise<string> {
  return new SignJWT({ email, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

/** Short-lived token embedded in the emailed magic link. */
export function signMagicToken(email: string): Promise<string> {
  return sign(email, "magic", "10m");
}

/** Long-lived session token stored in the httpOnly cookie. */
export function signSession(email: string): Promise<string> {
  return sign(email, "session", "30d");
}

/** Verify a token and require a specific kind. Returns claims or null. */
export async function verifyToken(
  token: string | undefined,
  kind: TokenKind,
): Promise<AuthClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== kind || typeof payload.email !== "string") return null;
    return payload as AuthClaims;
  } catch {
    return null;
  }
}

/** Is this address the single allowed owner? */
export function isOwner(email: string): boolean {
  const owner = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  return owner.length > 0 && email.trim().toLowerCase() === owner;
}

/** A valid session belongs to the owner and is of kind "session". */
export async function hasOwnerSession(token: string | undefined): Promise<boolean> {
  const claims = await verifyToken(token, "session");
  return !!claims && isOwner(claims.email);
}
