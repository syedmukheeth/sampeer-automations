import { NextResponse } from "next/server";
import { deleteProject } from "@features/business-os/project-dashboard/service";

export const runtime = "nodejs";

/** DELETE /api/projects/:id - remove a project. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persisted = await deleteProject(id);
  return NextResponse.json({ ok: true, persisted });
}
