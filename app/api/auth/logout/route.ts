import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "~/lib/auth";

export const runtime = "nodejs";

/** GET /api/auth/logout — clear the session cookie and return to /login. */
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", new URL(req.url).origin));
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
