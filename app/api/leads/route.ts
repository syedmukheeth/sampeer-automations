import { NextResponse } from "next/server";
import { listLeads, saveLead } from "@features/sales-os/lead-pipeline/service";
import { redactMoneyForAdmin } from "@shared/services/rbac";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** GET /api/leads - list all leads (deal value redacted for admin role). */
export async function GET() {
  const leads = await listLeads();
  return NextResponse.json(await redactMoneyForAdmin(leads, ["value"]));
}

/** POST /api/leads - create (no id) or update (id present). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { lead, persisted } = await saveLead(body);
    await logAudit((body as { id?: unknown })?.id ? "update" : "create", "lead", lead.id);
    return NextResponse.json({ ok: true, lead, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
