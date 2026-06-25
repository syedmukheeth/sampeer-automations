import { task } from "@trigger.dev/sdk";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument } from "../utils/invoice-pdf.js";
import type { InvoicePackage } from "../utils/schema.js";

/**
 * Render the final invoice package to a PDF. Returns base64 so the buffer
 * survives JSON serialization between tasks. Decode before attaching/storing.
 */
export const renderPdf = task({
  id: "render-pdf",
  retry: { maxAttempts: 2 },
  run: async (payload: { pkg: InvoicePackage }): Promise<{ pdfBase64: string; filename: string }> => {
    const buffer = await renderToBuffer(InvoiceDocument({ pkg: payload.pkg }));
    const safeNumber = payload.pkg.invoice.invoiceNumber.replace(/[^\w.-]/g, "_");
    return {
      pdfBase64: buffer.toString("base64"),
      filename: `Invoice-${safeNumber}.pdf`,
    };
  },
});
