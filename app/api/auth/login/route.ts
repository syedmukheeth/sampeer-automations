import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@shared/services/auth";
import { verifyLogin } from "@shared/services/credentials";

export const runtime = "nodejs";

/**
 * Brute-force throttle. In-memory per-instance (durable enough for a
 * single-owner deploy; swap for Redis/Upstash to share state across instances).
 * After MAX failures inside WINDOW_MS the IP is locked out until the window
 * rolls over. A successful login clears the counter.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const attempts = new Map<string, { count: number; first: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Returns remaining lockout seconds, or 0 if the caller may attempt a login. */
function lockedFor(ip: string): number {
  const rec = attempts.get(ip);
  if (!rec) return 0;
  const elapsed = Date.now() - rec.first;
  if (elapsed > WINDOW_MS) {
    attempts.delete(ip);
    return 0;
  }
  if (rec.count >= MAX_FAILURES) return Math.ceil((WINDOW_MS - elapsed) / 1000);
  return 0;
}

function recordFailure(ip: string): void {
  const rec = attempts.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

/**
 * POST /api/auth/login  { username, password }
 * Verifies owner/admin credentials (rate-limited) and sets a 30-day session.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const wait = lockedFor(ip);
  if (wait > 0) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { username, password } =
    typeof body === "object" && body !== null
      ? (body as { username?: unknown; password?: unknown })
      : {};

  const role =
    typeof username === "string" && typeof password === "string"
      ? verifyLogin(username, password)
      : null;

  if (!role) {
    recordFailure(ip);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  attempts.delete(ip);
  const session = await signSession((username as string).trim(), role);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
