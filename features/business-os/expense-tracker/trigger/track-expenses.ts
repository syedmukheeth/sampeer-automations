import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import {
  expenseInputSchema,
  type ExpenseInput,
  type ExpenseReport,
  type Category,
} from "../utils/schema.js";
import { validateInput } from "../utils/validate.js";
import { computeExpense } from "../utils/calc.js";
import { expenseAgent } from "./expense-agent.js";
import { renderExpensePdf } from "./render-expense-pdf.js";

/**
 * Top-level orchestrator: parsed transactions -> categorized, costed expense
 * report + branded PDF.
 *
 * Pipeline: validate (TS) -> model categorizes + writes prose -> totals (TS) ->
 *           assemble report -> render PDF.
 *
 * Core rule: the model only labels categories and writes insights. Every number
 * (totals, burn rate, category sums) is computed deterministically in calc.ts.
 */
export const trackExpenses = schemaTask({
  id: "track-expenses",
  schema: expenseInputSchema,
  maxDuration: 300,
  run: async (input: ExpenseInput, { ctx }) => {
    // ---- STEP 1: Validate (deterministic) -----------------------------
    const validation = validateInput(input);
    if (!validation.success) {
      logger.warn("Expense validation failed", { errors: validation.errors });
      return {
        validation: { success: false, errors: validation.errors },
      } satisfies Pick<ExpenseReport, "validation">;
    }

    // ---- STEP 2: Model - categories + merchant cleanup + prose --------
    const agentRun = await expenseAgent.triggerAndWait({
      input,
      promptVersion: input.promptVersion,
    });
    if (!agentRun.ok) {
      throw new Error(`expense-agent failed: ${agentRun.error}`);
    }
    const agent = agentRun.output;
    const categories = agent.transactions.map((t) => t.category) as Category[];
    const normalizedMerchants = agent.transactions.map((t) => t.normalizedMerchant);

    // ---- STEP 3: Totals (deterministic - never the LLM) ---------------
    const computed = computeExpense(input, categories, normalizedMerchants);

    // ---- STEP 4: Assemble the final report ----------------------------
    const report: ExpenseReport = {
      validation: { success: true, errors: [] },
      report: input.report,
      summary: computed.summary,
      byCategory: computed.byCategory,
      topMerchants: computed.topMerchants,
      daily: computed.daily,
      transactions: computed.transactions,
      headline: agent.headline,
      insights: agent.insights,
      branding: input.branding,
    };

    // ---- STEP 5: Render branded PDF -----------------------------------
    const pdfRun = await renderExpensePdf.triggerAndWait({ report });
    if (!pdfRun.ok) {
      throw new Error(`render-expense-pdf failed: ${pdfRun.error}`);
    }
    const { pdfBase64, filename } = pdfRun.output;

    return {
      ...report,
      pdfBase64,
      pdfFilename: filename,
      runId: ctx.run.id,
    };
  },
});

// Re-export the input schema type for the frontend trigger route.
export type TrackExpensesInput = z.infer<typeof expenseInputSchema>;
