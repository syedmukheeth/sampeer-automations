import { z } from "zod";

/* ------------------------------------------------------------------ *
 * INPUT — what the frontend form / upstream source sends.
 * Numbers are raw; all pricing math is done in calc.ts (never the LLM).
 * ------------------------------------------------------------------ */

export const lineItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().positive("Quantity must be > 0").default(1),
  unitPrice: z.number().nonnegative("Unit price must be >= 0"),
});

export const proposalInputSchema = z.object({
  company: z.object({
    name: z.string(),
    address: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    logoUrl: z.string().url().optional(),
  }),
  client: z.object({
    name: z.string(),
    email: z.string(),
    company: z.string().optional(),
    address: z.string().optional(),
  }),
  proposal: z.object({
    title: z.string(),
    number: z.string(),
    date: z.string(), // ISO yyyy-mm-dd
    validUntil: z.string(),
    preparedBy: z.string().optional(),
  }),
  project: z.object({
    name: z.string(),
    summary: z.string().optional(), // raw brief — agent expands into exec summary
  }),
  currency: z.string().min(1),
  items: z.array(lineItemSchema).min(1, "At least one investment item is required"),
  discount: z
    .object({ type: z.enum(["percent", "fixed"]), value: z.number().nonnegative() })
    .optional(),
  tax: z.object({ name: z.string().optional(), rate: z.number().nonnegative() }).optional(),
  terms: z.string().optional(), // manual override of generated terms
  notes: z.string().optional(),
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

export type ProposalInput = z.infer<typeof proposalInputSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;

/* ------------------------------------------------------------------ *
 * AGENT OUTPUT — the ONLY thing the model produces. Prose, never numbers.
 * ------------------------------------------------------------------ */

export const agentOutputSchema = z.object({
  executiveSummary: z.string(),
  items: z
    .array(z.object({ premiumDescription: z.string() }))
    .describe("Premium rewrites, one per input item, same order"),
  terms: z.string(),
  email: z.object({ subject: z.string(), body: z.string() }),
});

export type AgentOutput = z.infer<typeof agentOutputSchema>;

/* ------------------------------------------------------------------ *
 * FINAL PACKAGE — exact shape consumed by PDF + email services.
 * ------------------------------------------------------------------ */

export interface ProposalPackage {
  validation: { success: boolean; errors: string[] };
  proposal: {
    title: string;
    number: string;
    date: string;
    validUntil: string;
    currency: string;
    preparedBy: string;
  };
  company: ProposalInput["company"];
  client: ProposalInput["client"];
  project: ProposalInput["project"];
  executiveSummary: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  summary: { subtotal: number; discount: number; tax: number; total: number };
  terms: string;
  notes: string;
  email: { subject: string; body: string };
  branding?: {
    accentColor?: string;
    invoiceFooter?: string;
    emailSignatureName?: string;
    logoUrl?: string;
  };
}
