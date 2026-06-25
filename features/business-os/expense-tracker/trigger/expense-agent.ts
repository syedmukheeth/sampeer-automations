import { task, logger } from "@trigger.dev/sdk";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import {
  agentOutputSchema,
  type AgentOutput,
  type ExpenseInput,
} from "../utils/schema.js";
import { getExpenseSystemPrompt } from "../prompts/expense-agent.js";

/**
 * The model's ONLY job: categorize each transaction (fixed taxonomy, same order),
 * normalize merchant names, and write a headline + qualitative insights. It
 * receives NO totals and produces NO numbers - all math is in ../utils/calc.ts.
 */
export const expenseAgent = task({
  id: "expense-agent",
  retry: { maxAttempts: 3 },
  run: async (payload: {
    input: ExpenseInput;
    promptVersion?: string;
  }): Promise<AgentOutput> => {
    const { input, promptVersion } = payload;

    const txnsForPrompt = input.transactions.map((t, i) => ({
      index: i,
      date: t.date,
      description: t.description,
      merchant: t.merchant ?? "",
      direction: t.amount < 0 ? "outflow" : "inflow",
    }));

    const prompt = JSON.stringify(
      {
        report: input.report.name,
        period: `${input.report.periodStart} to ${input.report.periodEnd}`,
        currency: input.report.currency,
        transactions: txnsForPrompt,
      },
      null,
      2,
    );

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: agentOutputSchema,
      system: getExpenseSystemPrompt(promptVersion),
      prompt,
      temperature: 0.3,
    });

    // Safety: enforce 1:1 alignment regardless of model behaviour.
    if (object.transactions.length !== input.transactions.length) {
      logger.warn("Agent returned mismatched transaction count; padding/truncating", {
        got: object.transactions.length,
        expected: input.transactions.length,
      });
      const fixed = input.transactions.map(
        (t, i) =>
          object.transactions[i] ?? {
            category: t.amount >= 0 ? "Income" : "Other",
          },
      );
      return { ...object, transactions: fixed };
    }

    return object;
  },
});
