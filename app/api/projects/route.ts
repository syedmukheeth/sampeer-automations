import { NextResponse } from "next/server";
import { listProjects, saveProject } from "@features/business-os/project-dashboard/service";

export const runtime = "nodejs";

/** GET /api/projects - list all projects. */
export async function GET() {
  return NextResponse.json(await listProjects());
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
    return NextResponse.json({ ok: true, project, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
