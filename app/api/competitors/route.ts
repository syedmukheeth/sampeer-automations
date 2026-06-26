import { NextResponse } from "next/server";
import { listCompetitors, saveCompetitor } from "@features/growth-os/competitor-radar/service";
import { redactMoneyForAdmin } from "@shared/services/rbac";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** GET /api/competitors - list all (pricing redacted for admin role). */
export async function GET() {
  const competitors = await listCompetitors();
  return NextResponse.json(await redactMoneyForAdmin(competitors, ["pricing"]));
}

/** POST /api/competitors - create (no id) or update (id present). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { competitor, persisted } = await saveCompetitor(body);
    await logAudit((body as { id?: unknown })?.id ? "update" : "create", "competitor", competitor.id);
    return NextResponse.json({ ok: true, competitor, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
