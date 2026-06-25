import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@shared/services/settings";

export const runtime = "nodejs";

/** GET /api/settings - current platform settings (owner-gated by middleware). */
export async function GET() {
  return NextResponse.json(await getSettings());
}

/** PUT /api/settings - persist a (partial) settings update. */
export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { settings, persisted } = await saveSettings(body);
    return NextResponse.json({ ok: true, settings, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
