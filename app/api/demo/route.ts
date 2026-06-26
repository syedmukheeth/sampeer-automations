import { NextResponse } from "next/server";
import { seedDemo, clearDemo, isDemoResource } from "@shared/services/demo-data";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/**
 * POST /api/demo  { action: "seed" | "clear", resource?: "clients" | "leads" | "projects" | "competitors" }
 * Loads or removes demo data. With `resource`, scopes to that one automation;
 * without it, applies to all. Gated by middleware (owner or admin).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, resource } = (body ?? {}) as { action?: unknown; resource?: unknown };

  if (resource !== undefined && !isDemoResource(resource)) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
  }
  const scope = resource as undefined | "clients" | "leads" | "projects" | "competitors";

  if (action === "seed") {
    await seedDemo(scope);
    await logAudit("create", `demo-data${scope ? `:${scope}` : ""}`);
    return NextResponse.json({ ok: true, action, resource: scope ?? "all" });
  }
  if (action === "clear") {
    await clearDemo(scope);
    await logAudit("delete", `demo-data${scope ? `:${scope}` : ""}`);
    return NextResponse.json({ ok: true, action, resource: scope ?? "all" });
  }
  return NextResponse.json({ error: "action must be 'seed' or 'clear'" }, { status: 400 });
}
