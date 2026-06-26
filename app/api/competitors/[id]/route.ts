import { NextResponse } from "next/server";
import { deleteCompetitor } from "@features/growth-os/competitor-radar/service";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** DELETE /api/competitors/:id - remove a competitor. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteCompetitor(id);
  await logAudit("delete", "competitor", id);
  return NextResponse.json({ ok: true, persisted });
}
