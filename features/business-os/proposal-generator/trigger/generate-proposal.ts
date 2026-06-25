import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import {
  proposalInputSchema,
  type ProposalInput,
  type ProposalPackage,
} from "../utils/schema.js";
import { validateInput } from "../utils/validate.js";
import { computeTotals, formatMoney } from "../utils/calc.js";
import { proposalAgent } from "./proposal-agent.js";
import { renderProposalPdf } from "./render-proposal-pdf.js";
import { sendProposalEmail } from "./send-proposal-email.js";

/**
 * Orchestrator: brief → validated, branded, emailed proposal.
 *
 * Pipeline: validate (TS) → totals (TS) → model prose → assemble package →
 *           render PDF → send via Resend/Composio Gmail.
 *
 * Mirrors generate-invoice: all pricing math in TS, model writes prose only.
 */
export const generateProposal = schemaTask({
  id: "generate-proposal",
  schema: proposalInputSchema,
  maxDuration: 300,
  run: async (input: ProposalInput, { ctx }) => {
    // ---- STEP 1: Validate (deterministic) -----------------------------
    const validation = validateInput(input);
    if (!validation.success) {
      logger.warn("Proposal validation failed", { errors: validation.errors });
      return {
        validation: { success: false, errors: validation.errors },
      } satisfies Pick<ProposalPackage, "validation">;
    }

    // ---- STEP 2: Totals (deterministic — never the LLM) ---------------
    const totals = computeTotals(input);
    const cur = input.currency;
    const totalDisplay = formatMoney(totals.total, cur);

    // ---- STEP 3: Model — exec summary, descriptions, terms, email -----
    const agentRun = await proposalAgent.triggerAndWait({
      input,
      totalDisplay,
      promptVersion: input.promptVersion,
    });
    if (!agentRun.ok) {
      throw new Error(`proposal-agent failed: ${agentRun.error}`);
    }
    const agent = agentRun.output;

    // ---- STEP 4: Assemble the final package ---------------------------
    const pkg: ProposalPackage = {
      validation: { success: true, errors: [] },
      proposal: {
        title: input.proposal.title,
        number: input.proposal.number,
        date: input.proposal.date,
        validUntil: input.proposal.validUntil,
        currency: cur,
        preparedBy: input.proposal.preparedBy ?? input.company.name,
      },
      company: input.company,
      client: input.client,
      project: input.project,
      executiveSummary: agent.executiveSummary,
      items: input.items.map((it, i) => ({
        name: it.name,
        description: agent.items[i]?.premiumDescription ?? it.description ?? "",
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: totals.lineTotals[i],
      })),
      summary: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
      },
      terms: input.terms ?? agent.terms,
      notes: input.notes ?? "",
      email: agent.email,
      branding: input.branding,
    };

    // ---- STEP 5: Render branded PDF -----------------------------------
    const pdfRun = await renderProposalPdf.triggerAndWait({ pkg });
    if (!pdfRun.ok) {
      throw new Error(`render-proposal-pdf failed: ${pdfRun.error}`);
    }
    const { pdfBase64, filename } = pdfRun.output;

    // ---- STEP 6: Send via Resend / Composio Gmail ---------------------
    const emailRun = await sendProposalEmail.triggerAndWait({
      to: input.client.email,
      subject: agent.email.subject,
      body: buildEmailBody(agent.email.body, input, totalDisplay),
      pdfBase64,
      filename,
    });
    if (!emailRun.ok) {
      logger.error("Email send failed; proposal package still generated", {
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

/** Wrap the agent's email copy with a branded signature + reference line. */
function buildEmailBody(agentBody: string, input: ProposalInput, totalDisplay: string): string {
  const c = input.company;
  const contact = [c.email, c.phone].filter(Boolean).join("  •  ");
  const sig = ["—", input.branding?.emailSignatureName || c.name, c.address, contact]
    .filter(Boolean)
    .join("\n");
  const ref = [
    "",
    `This proposal (${input.proposal.number}) — "${input.proposal.title}" — totals ${totalDisplay},`,
    `valid until ${input.proposal.validUntil}. The PDF is attached for your review.`,
    "Reply to this email with any questions — we're happy to walk you through it.",
  ].join("\n");
  return `${agentBody.trim()}\n${ref}\n\n${sig}`;
}

export type GenerateProposalInput = z.infer<typeof proposalInputSchema>;
