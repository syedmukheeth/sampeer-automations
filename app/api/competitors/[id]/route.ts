import { NextResponse } from "next/server";
import { deleteCompetitor } from "@features/growth-os/competitor-radar/service";

export const runtime = "nodejs";

/** DELETE /api/competitors/:id - remove a competitor. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteCompetitor(id);
  return NextResponse.json({ ok: true, persisted });
}
