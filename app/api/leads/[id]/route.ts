import { NextResponse } from "next/server";
import { deleteLead } from "@features/sales-os/lead-pipeline/service";

export const runtime = "nodejs";

/** DELETE /api/leads/:id - remove a lead. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteLead(id);
  return NextResponse.json({ ok: true, persisted });
}
