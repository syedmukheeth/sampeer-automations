import { NextResponse } from "next/server";
import { listClients, saveClient } from "@features/business-os/client-crm/service";
import { redactMoneyForAdmin } from "@shared/services/rbac";
import { logAudit } from "@shared/services/audit";

export const runtime = "nodejs";

/** GET /api/clients - list all clients (money redacted for admin role). */
export async function GET() {
  const clients = await listClients();
  return NextResponse.json(await redactMoneyForAdmin(clients, ["value"]));
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
    await logAudit((body as { id?: unknown })?.id ? "update" : "create", "client", client.id);
    return NextResponse.json({ ok: true, client, persisted });
  } catch (err) {
    return NextResponse.json(
      { error: "Validation failed", detail: String((err as Error)?.message ?? err) },
      { status: 422 },
    );
  }
}
