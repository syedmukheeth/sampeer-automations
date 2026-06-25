import { NextResponse } from "next/server";
import { getInstalls, setInstalled } from "@shared/services/installs";
import { getAutomation } from "@features/registry";

export const runtime = "nodejs";

/** GET /api/installs — current install map (owner-gated by middleware). */
export async function GET() {
  return NextResponse.json(await getInstalls());
}

/** PUT /api/installs — { slug, enabled }. Toggle an automation. */
export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { slug, enabled } = (body ?? {}) as { slug?: unknown; enabled?: unknown };
  if (typeof slug !== "string" || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "slug (string) and enabled (boolean) required" }, { status: 422 });
  }
  const automation = getAutomation(slug);
  if (!automation || automation.status !== "live") {
    return NextResponse.json({ error: "Unknown or not-yet-available automation" }, { status: 404 });
  }
  const { state, persisted } = await setInstalled(slug, enabled);
  return NextResponse.json({ ok: true, state, persisted });
}
