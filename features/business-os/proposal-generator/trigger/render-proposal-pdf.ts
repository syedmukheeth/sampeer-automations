import { task } from "@trigger.dev/sdk";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProposalDocument } from "../utils/proposal-pdf.js";
import type { ProposalPackage } from "../utils/schema.js";

/**
 * Render the final proposal package to a PDF. Returns base64 so the buffer
 * survives JSON serialization between tasks. (Filename is feature-unique to
 * avoid Trigger.dev bundle path collisions across automations.)
 */
export const renderProposalPdf = task({
  id: "render-proposal-pdf",
  retry: { maxAttempts: 2 },
  run: async (payload: { pkg: ProposalPackage }): Promise<{ pdfBase64: string; filename: string }> => {
    const buffer = await renderToBuffer(ProposalDocument({ pkg: payload.pkg }));
    const safeNumber = payload.pkg.proposal.number.replace(/[^\w.-]/g, "_");
    return {
      pdfBase64: buffer.toString("base64"),
      filename: `Proposal-${safeNumber}.pdf`,
    };
  },
});
