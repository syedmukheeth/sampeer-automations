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

export type AuthClaims = JWTPayload & { username: string; kind: TokenKind };

async function sign(username: string, kind: TokenKind, ttl: string): Promise<string> {
  return new SignJWT({ username, kind })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

/** Long-lived session token stored in the httpOnly cookie. */
export function signSession(username: string): Promise<string> {
  return sign(username, "session", "30d");
}

/** Verify a token and require a specific kind. Returns claims or null. */
export async function verifyToken(
  token: string | undefined,
  kind: TokenKind,
): Promise<AuthClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== kind || typeof payload.username !== "string") return null;
    return payload as AuthClaims;
  } catch {
    return null;
  }
}

/** Do these credentials match the single allowed owner? */
export function isOwnerLogin(username: string, password: string): boolean {
  const expectedUsername = (process.env.AUTH_USERNAME ?? "").trim();
  const expectedPassword = process.env.AUTH_PASSWORD ?? "";
  return (
    expectedUsername.length > 0 &&
    expectedPassword.length > 0 &&
    username.trim() === expectedUsername &&
    password === expectedPassword
  );
}

/** Is this username the configured owner? */
export function isOwnerUsername(username: string): boolean {
  const owner = (process.env.AUTH_USERNAME ?? "").trim();
  return owner.length > 0 && username.trim() === owner;
}

/** A valid session belongs to the owner and is of kind "session". */
export async function hasOwnerSession(token: string | undefined): Promise<boolean> {
  const claims = await verifyToken(token, "session");
  return !!claims && isOwnerUsername(claims.username);
}
