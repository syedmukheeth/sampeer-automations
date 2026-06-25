import { triggerInvoice } from "@features/business-os/invoice-generator/api/handlers";

/**
 * POST /api/invoices — delegates to the Invoice Generator feature. URL kept
 * stable so the client stays unchanged after the platform migration.
 */
export function POST(req: Request) {
  return triggerInvoice(req);
}
