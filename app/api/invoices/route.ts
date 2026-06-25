import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import type { generateInvoice } from "~/trigger/generate-invoice";
import { invoiceInputSchema } from "~/lib/schema";

/**
 * POST /api/invoices
 * Validates shape, then triggers the generate-invoice task server-side
 * (TRIGGER_SECRET_KEY never reaches the client). Returns the run id to poll.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Cheap client-side-shape guard. Deep field validation happens in the task.
  const parsed = invoiceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  const handle = await tasks.trigger<typeof generateInvoice>(
    "generate-invoice",
    parsed.data,
    { tags: [`client:${parsed.data.client.email}`, `invoice:${parsed.data.invoice.number}`] },
  );

  return NextResponse.json({ runId: handle.id });
}
