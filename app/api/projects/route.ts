import { NextResponse } from "next/server";
import { listProjects, saveProject } from "@features/business-os/project-dashboard/service";
import { redactMoneyForAdmin } from "@shared/services/rbac";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** GET /api/projects - list all projects (value redacted for admin role). */
export async function GET() {
  const projects = await listProjects();
  return NextResponse.json(await redactMoneyForAdmin(projects, ["value"]));
}

/** POST /api/projects - create (no id) or update (id present). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { project, persisted } = await saveProject(body);
    await logAudit((body as { id?: unknown })?.id ? "update" : "create", "project", project.id);
    return NextResponse.json({ ok: true, project, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
