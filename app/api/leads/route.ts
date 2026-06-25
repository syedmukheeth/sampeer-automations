import { NextResponse } from "next/server";
import { listLeads, saveLead } from "@features/sales-os/lead-pipeline/service";

export const runtime = "nodejs";

/** GET /api/leads - list all leads. */
export async function GET() {
  return NextResponse.json(await listLeads());
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
    return NextResponse.json({ ok: true, lead, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
