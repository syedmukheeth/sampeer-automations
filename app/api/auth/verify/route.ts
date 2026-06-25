import { NextResponse } from "next/server";
import { isOwner, signSession, verifyToken, SESSION_COOKIE } from "~/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/auth/verify?token=…
 * Validates the magic token, then sets the long-lived owner session cookie
 * and redirects to the dashboard. Invalid/expired → back to /login.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? undefined;

  const claims = await verifyToken(token, "magic");
  if (!claims || !isOwner(claims.email)) {
    return NextResponse.redirect(new URL("/login?error=invalid", url.origin));
  }

  const session = await signSession(claims.email);
  const res = NextResponse.redirect(new URL("/", url.origin));
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
