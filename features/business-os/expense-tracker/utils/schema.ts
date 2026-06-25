import { z } from "zod";

/* ------------------------------------------------------------------ *
 * Expense Tracker - schema.
 * Input is structured transactions (parsed from CSV client-side, see csv.ts).
 * The LLM only assigns categories + writes prose; ALL money math is in calc.ts.
 * ------------------------------------------------------------------ */

/** Fixed spend taxonomy. Order/labels are the contract shared with the agent. */
export const CATEGORIES = [
  "Software & SaaS",
  "Payroll & Contractors",
  "Marketing & Ads",
  "Office & Rent",
  "Travel",
  "Meals & Entertainment",
  "Hardware",
  "Bank & Fees",
  "Taxes",
  "Income",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export const categoryEnum = z.enum(CATEGORIES);

/** One bank/card line. `amount` is SIGNED: negative = money out, positive = in. */
export const transactionSchema = z.object({
  date: z.string().min(1), // ISO yyyy-mm-dd
  description: z.string().min(1, "Transaction description is required"),
  amount: z.number().finite(),
  merchant: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const MAX_TRANSACTIONS = 200;

export const expenseInputSchema = z.object({
  report: z.object({
    name: z.string().min(1),
    periodStart: z.string().min(1), // ISO yyyy-mm-dd
    periodEnd: z.string().min(1),
    currency: z.string().min(1),
  }),
  transactions: z
    .array(transactionSchema)
    .min(1, "At least one transaction is required")
    .max(MAX_TRANSACTIONS, `At most ${MAX_TRANSACTIONS} transactions per report`),
  // White-label branding injected server-side from platform settings.
  branding: z
    .object({
      accentColor: z.string().optional(),
      invoiceFooter: z.string().optional(),
      emailSignatureName: z.string().optional(),
      logoUrl: z.string().optional(),
    })
    .optional(),
  promptVersion: z.enum(["v1", "v2"]).optional(),
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;

/* ------------------------------------------------------------------ *
 * AGENT OUTPUT - the ONLY thing the model produces. Labels + prose, no numbers.
 * ------------------------------------------------------------------ */

export const agentOutputSchema = z.object({
  transactions: z
    .array(
      z.object({
        // 1:1 with input transactions, same order
        category: categoryEnum,
        normalizedMerchant: z.string().optional(),
      }),
    )
    .describe("One category per input transaction, in the same order"),
  headline: z.string().describe("One-line summary of the period's spending story"),
  insights: z
    .array(z.string())
    .describe("3-5 qualitative observations. No fabricated figures."),
});

export type AgentOutput = z.infer<typeof agentOutputSchema>;

/* ------------------------------------------------------------------ *
 * FINAL PACKAGE - exact shape consumed by the UI + PDF.
 * ------------------------------------------------------------------ */

export interface CategoryTotal {
  category: Category;
  total: number; // spend (outflow) in this category
  count: number;
  pct: number; // share of total spend, 0-100
}

export interface MerchantTotal {
  merchant: string;
  total: number;
  count: number;
}

export interface ExpenseReport {
  validation: { success: boolean; errors: string[] };
  report: {
    name: string;
    periodStart: string;
    periodEnd: string;
    currency: string;
  };
  summary: {
    totalSpend: number;
    totalIncome: number;
    net: number; // income - spend
    txnCount: number;
    periodDays: number;
    dailyBurn: number;
    monthlyBurn: number;
  };
  byCategory: CategoryTotal[];
  topMerchants: MerchantTotal[];
  daily: { label: string; spend: number }[];
  transactions: Array<{
    date: string;
    description: string;
    merchant: string;
    amount: number;
    category: Category;
  }>;
  headline: string;
  insights: string[];
  branding?: {
    accentColor?: string;
    invoiceFooter?: string;
    emailSignatureName?: string;
    logoUrl?: string;
  };
}
