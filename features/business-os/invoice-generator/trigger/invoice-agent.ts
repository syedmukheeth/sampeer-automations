import { task, logger } from "@trigger.dev/sdk";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { agentOutputSchema, type AgentOutput, type InvoiceInput } from "../utils/schema.js";
import { getInvoiceSystemPrompt } from "../prompts/invoice-agent.js";

/**
 * The model's ONLY job: turn generic services into premium descriptions and
 * write the notes + client email copy. It receives NO totals and produces
 * NO numbers - all math is deterministic (see ../utils/calc.ts).
 */
export const invoiceAgent = task({
  id: "invoice-agent",
  retry: { maxAttempts: 3 },
  run: async (payload: {
    input: InvoiceInput;
    // Pre-computed display strings so the email can mention an amount/date
    // without the model ever computing them.
    totalDisplay: string;
    dueDate: string;
    promptVersion?: string;
  }): Promise<AgentOutput> => {
    const { input, totalDisplay, dueDate, promptVersion } = payload;

    const itemsForPrompt = input.items.map((it, i) => ({
      index: i,
      name: it.name,
      description: it.description ?? "",
    }));

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
      system: getInvoiceSystemPrompt(promptVersion),
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
