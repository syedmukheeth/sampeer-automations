import { getInvoiceRun } from "@features/business-os/invoice-generator/api/handlers";

/** GET /api/invoices/:runId — delegates to the Invoice Generator feature. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  return getInvoiceRun(runId);
}
