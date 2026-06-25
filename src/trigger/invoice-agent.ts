import { task, logger } from "@trigger.dev/sdk";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { agentOutputSchema, type AgentOutput, type InvoiceInput } from "~/lib/schema.js";

/**
 * Claude's ONLY job: turn generic services into premium descriptions and
 * write the notes + client email copy. It receives NO totals and produces
 * NO numbers — all math is deterministic (see calc.ts).
 */
export const invoiceAgent = task({
  id: "invoice-agent",
  retry: { maxAttempts: 3 },
  run: async (payload: {
    input: InvoiceInput;
    // Pre-computed display strings so the email can mention an amount/date
    // without Claude ever computing them.
    totalDisplay: string;
    dueDate: string;
  }): Promise<AgentOutput> => {
    const { input, totalDisplay, dueDate } = payload;

    const itemsForPrompt = input.items.map((it, i) => ({
      index: i,
      name: it.name,
      description: it.description ?? "",
    }));

    const system = [
      "You are the Finance Operations Manager for Sampeer Studio — a premium creative & digital studio",
      "crafting brand-led websites, custom AI automation, and growth/SEO systems for ambitious clients.",
      "Write polished, confident, client-facing invoice copy in a warm but professional studio voice.",
      "RULES:",
      "- Rewrite each generic service into a premium, specific, outcome-oriented description.",
      "  Examples: 'Website' -> 'Premium Storytelling Website Design & Development';",
      "  'Automation' -> 'Custom AI Workflow Development & Integration';",
      "  'SEO' -> 'Technical SEO Setup & Performance Optimization'.",
      "- Keep each description to one concise line. No pricing, quantities, or numbers.",
      "- Return exactly one premiumDescription per input item, in the same order.",
      "- notes: 2-3 short, gracious sentences — thank the client, affirm the partnership, invite questions.",
      "  No numbers; keep it on-brand for a high-end studio.",
      "- email.subject: concise and professional; include the invoice number and the studio name.",
      "- email.body: a brief, warm plain-text email. Use real line breaks (\\n) to separate parts.",
      "  Structure exactly: 'Dear <client name>,' then a blank line, then 1-2 sentences of genuine",
      "  appreciation plus a line that the invoice details are attached, then a blank line, then a short",
      "  closing line on its own (e.g. 'With appreciation,').",
      "  Do NOT add a signature, company name, address, or contact block (those are appended automatically).",
      "  No numbers anywhere in the body.",
      "- Never invent prices, taxes, discounts, or client data.",
    ].join("\n");

    const prompt = JSON.stringify(
      {
        company: input.company.name,
        client: { name: input.client.name },
        project: input.project,
        invoiceNumber: input.invoice.number,
        paymentTerms: input.invoice.paymentTerms ?? "as agreed",
        amountDue: totalDisplay, // display string only
        dueDate,
        items: itemsForPrompt,
      },
      null,
      2,
    );

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: agentOutputSchema,
      system,
      prompt,
      temperature: 0.4,
    });

    // Safety: enforce 1:1 item alignment regardless of model behaviour.
    if (object.items.length !== input.items.length) {
      logger.warn("Agent returned mismatched item count; padding/truncating", {
        got: object.items.length,
        expected: input.items.length,
      });
      const fixed = input.items.map(
        (it, i) =>
          object.items[i] ?? { premiumDescription: it.description ?? it.name },
      );
      return { ...object, items: fixed };
    }

    return object;
  },
});
