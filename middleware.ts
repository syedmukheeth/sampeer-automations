import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasOwnerSession, SESSION_COOKIE } from "@shared/services/auth";

/**
 * Gate the entire app behind a single-owner session.
 * Public: /login and /api/auth/*. Everything else (dashboard, every
 * automation page, and /api/invoices) requires a valid owner session.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public auth surface.
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await hasOwnerSession(token)) {
    return NextResponse.next();
  }

  // API → 401 JSON; pages → redirect to login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)"],
};
