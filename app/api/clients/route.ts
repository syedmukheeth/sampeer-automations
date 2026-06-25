import { NextResponse } from "next/server";
import { listClients, saveClient } from "@features/business-os/client-crm/service";

export const runtime = "nodejs";

/** GET /api/clients - list all clients. */
export async function GET() {
  return NextResponse.json(await listClients());
}

/** POST /api/clients - create (no id) or update (id present). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    const { client, persisted } = await saveClient(body);
    return NextResponse.json({ ok: true, client, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
