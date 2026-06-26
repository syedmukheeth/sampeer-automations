import { NextResponse } from "next/server";
import { deleteLead } from "@features/sales-os/lead-pipeline/service";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** DELETE /api/leads/:id - remove a lead. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteLead(id);
  await logAudit("delete", "lead", id);
  return NextResponse.json({ ok: true, persisted });
}
