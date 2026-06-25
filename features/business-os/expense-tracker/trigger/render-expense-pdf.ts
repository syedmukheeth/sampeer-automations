import { task } from "@trigger.dev/sdk";
import { renderToBuffer } from "@react-pdf/renderer";
import { ExpenseDocument } from "../utils/expense-pdf.js";
import type { ExpenseReport } from "../utils/schema.js";

/**
 * Render the expense report to a PDF. Returns base64 so the buffer survives
 * JSON serialization between tasks. Decode before downloading/storing.
 */
export const renderExpensePdf = task({
  id: "render-expense-pdf",
  retry: { maxAttempts: 2 },
  run: async (payload: { report: ExpenseReport }): Promise<{ pdfBase64: string; filename: string }> => {
    const buffer = await renderToBuffer(ExpenseDocument({ report: payload.report }));
    const safeName = payload.report.report.name.replace(/[^\w.-]/g, "_");
    return {
      pdfBase64: buffer.toString("base64"),
      filename: `Expense-Report-${safeName}.pdf`,
    };
  },
});
