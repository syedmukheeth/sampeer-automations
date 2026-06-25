import { NextResponse } from "next/server";
import { listCompetitors, saveCompetitor } from "@features/growth-os/competitor-radar/service";

export const runtime = "nodejs";

/** GET /api/competitors - list all tracked competitors. */
export async function GET() {
  return NextResponse.json(await listCompetitors());
}

/** POST /api/competitors - create (no id) or update (id present). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { competitor, persisted } = await saveCompetitor(body);
    return NextResponse.json({ ok: true, competitor, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
