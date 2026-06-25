import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import {
  invoiceInputSchema,
  type InvoiceInput,
  type InvoicePackage,
} from "~/lib/schema.js";
import { validateInput } from "~/lib/validate.js";
import { computeTotals, formatMoney } from "~/lib/calc.js";
import { invoiceAgent } from "./invoice-agent.js";
import { renderPdf } from "./render-pdf.js";
import { sendEmail } from "./send-email.js";

/**
 * Top-level orchestrator: New Project -> validated, branded, emailed invoice.
 *
 * Pipeline: validate (TS) -> totals (TS) -> Claude prose -> assemble
 *           package -> render PDF -> send via Composio Gmail.
 *
 * Returns the full InvoicePackage (+ pdfBase64) — valid JSON, ready for any
 * PDF/email consumer. On validation failure it returns errors and stops.
 */
export const generateInvoice = schemaTask({
  id: "generate-invoice",
  schema: invoiceInputSchema,
  maxDuration: 300,
  run: async (input: InvoiceInput, { ctx }) => {
    // ---- STEP 1: Validate (deterministic) -----------------------------
    const validation = validateInput(input);
    if (!validation.success) {
      logger.warn("Invoice validation failed", { errors: validation.errors });
      return {
        validation: { success: false, errors: validation.errors },
      } satisfies Pick<InvoicePackage, "validation">;
    }

    // ---- STEP 3: Totals (deterministic — never the LLM) ---------------
    const totals = computeTotals(input);
    const cur = input.currency;
    const totalDisplay = formatMoney(totals.total, cur);

    // ---- STEP 2/6/7: Claude — premium descriptions, notes, email ------
    const agentRun = await invoiceAgent.triggerAndWait({
      input,
      totalDisplay,
      dueDate: input.invoice.dueDate,
    });
    if (!agentRun.ok) {
      throw new Error(`invoice-agent failed: ${agentRun.error}`);
    }
    const agent = agentRun.output;

    // ---- STEP 4/5/8: Assemble the final package -----------------------
    const methods = paymentMethods(input);
    const pkg: InvoicePackage = {
      validation: { success: true, errors: [] },
      invoice: {
        invoiceNumber: input.invoice.number,
        issueDate: input.invoice.issueDate,
        dueDate: input.invoice.dueDate,
        status: input.invoice.status ?? (totals.remaining <= 0 ? "Paid" : "Unpaid"),
        currency: cur,
        projectId: input.project.id ?? input.invoice.referenceNumber ?? "",
        referenceNumber: input.invoice.referenceNumber ?? input.invoice.number,
        paymentTerms: input.invoice.paymentTerms ?? "Due on receipt",
      },
      company: input.company,
      client: input.client,
      project: input.project,
      items: input.items.map((it, i) => ({
        description: agent.items[i]?.premiumDescription ?? it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: totals.lineTotals[i],
      })),
      summary: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        paid: totals.paid,
        remaining: totals.remaining,
      },
      payment: {
        methods,
        instructions: methods.length
          ? `Please complete payment of ${totalDisplay} by ${input.invoice.dueDate} using any of the methods below. Reference invoice ${input.invoice.number} with your payment.`
          : "",
        details: input.payment,
      },
      // Manual override wins; otherwise use the agent's notes.
      notes: input.notes ?? agent.notes,
      email: agent.email,
    };

    // ---- STEP 8: Render branded PDF -----------------------------------
    const pdfRun = await renderPdf.triggerAndWait({ pkg });
    if (!pdfRun.ok) {
      throw new Error(`render-pdf failed: ${pdfRun.error}`);
    }
    const { pdfBase64, filename } = pdfRun.output;

    // ---- Send via Composio Gmail --------------------------------------
    const emailRun = await sendEmail.triggerAndWait({
      to: input.client.email,
      subject: agent.email.subject,
      body: buildEmailBody(agent.email.body, input, totalDisplay),
      pdfBase64,
      filename,
    });
    if (!emailRun.ok) {
      // PDF + package are still valid; report the send failure but return them.
      logger.error("Email send failed; invoice package still generated", {
        error: emailRun.error,
      });
    }

    return {
      ...pkg,
      pdfBase64,
      pdfFilename: filename,
      emailSent: emailRun.ok,
      runId: ctx.run.id,
    };
  },
});

/**
 * Wrap the agent's email copy with a professional, branded signature block.
 * The footer adds legitimacy (real sender identity + contact + a transactional
 * reference line) — both premium polish and a deliverability/anti-spam signal.
 */
function buildEmailBody(
  agentBody: string,
  input: InvoiceInput,
  totalDisplay: string,
): string {
  const c = input.company;
  const contact = [c.email, c.phone].filter(Boolean).join("  •  ");
  const sig = [
    "—",
    c.name,
    c.address,
    contact,
  ]
    .filter(Boolean)
    .join("\n");

  const ref = [
    "",
    `This invoice (${input.invoice.number}) for "${input.project.name}" totals ${totalDisplay},`,
    `due ${input.invoice.dueDate}. The PDF is attached for your records.`,
    "Reply to this email with any questions — we're happy to help.",
  ].join("\n");

  return `${agentBody.trim()}\n${ref}\n\n${sig}`;
}

/** Build the accepted-methods list (Step 5) from provided inputs only. */
function paymentMethods(input: InvoiceInput): string[] {
  const p = input.payment;
  if (!p) return [];
  const m: string[] = [];
  if (p.bankTransfer) m.push("Bank Transfer");
  if (p.upi) m.push("UPI");
  if (p.stripe) m.push("Stripe");
  if (p.wise) m.push("Wise");
  if (p.paypal) m.push("PayPal");
  return m;
}

// Re-export the input schema type for the frontend trigger route.
export type GenerateInvoiceInput = z.infer<typeof invoiceInputSchema>;
