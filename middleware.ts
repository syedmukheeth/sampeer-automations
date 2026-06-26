import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionClaims, SESSION_COOKIE } from "@shared/services/auth";

/** Routes the admin role may not touch — Settings holds secrets/config. */
function isOwnerOnlyPath(pathname: string): boolean {
  return pathname.startsWith("/settings") || pathname.startsWith("/api/settings");
}

/**
 * Gate the entire app behind a valid session (owner OR admin).
 * Public: /login and /api/auth/*. Owner-only paths (Settings + its API)
 * are additionally blocked for the admin role.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public auth surface.
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = await getSessionClaims(token);

  // No session at all -> 401 JSON for APIs, redirect to login for pages.
  if (!claims) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Authenticated, but admin hitting an owner-only path -> forbid.
  if (claims.role !== "owner" && isOwnerOnlyPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)"],
};
