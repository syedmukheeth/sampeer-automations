import { NextResponse } from "next/server";
import { seedDemo, clearDemo } from "@shared/services/demo-data";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/**
 * POST /api/demo  { action: "seed" | "clear" }
 * Loads or removes the demo dataset across all KV-backed automations.
 * Gated by middleware (any valid session — owner or admin).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = (body as { action?: unknown })?.action;
  if (action === "seed") {
    await seedDemo();
    await logAudit("create", "demo-data");
    return NextResponse.json({ ok: true, action });
  }
  if (action === "clear") {
    await clearDemo();
    await logAudit("delete", "demo-data");
    return NextResponse.json({ ok: true, action });
  }
  return NextResponse.json({ error: "action must be 'seed' or 'clear'" }, { status: 400 });
}
