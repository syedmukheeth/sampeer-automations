import { NextResponse } from "next/server";
import { isOwnerLogin, signSession, SESSION_COOKIE } from "@shared/services/auth";

export const runtime = "nodejs";

/**
 * POST /api/auth/login  { username, password }
 * Validates the single configured owner login and sets a 30-day session cookie.
 */
export async function POST(req: Request) {
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

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !isOwnerLogin(username, password)
  ) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const session = await signSession(username);
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
