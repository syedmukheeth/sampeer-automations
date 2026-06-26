import { NextResponse } from "next/server";
import { deleteClient } from "@features/business-os/client-crm/service";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** DELETE /api/clients/:id - remove a client. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteClient(id);
  await logAudit("delete", "client", id);
  return NextResponse.json({ ok: true, persisted });
}
