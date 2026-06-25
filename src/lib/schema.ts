import { z } from "zod";

/* ------------------------------------------------------------------ *
 * INPUT — what the frontend form / upstream source sends.
 * Numbers are raw; all math is done in calc.ts (never by the LLM).
 * ------------------------------------------------------------------ */

export const itemInputSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().positive("Quantity must be > 0"),
  unitPrice: z.number().nonnegative("Unit price must be >= 0"),
});

export const paymentMethodSchema = z.object({
  bankTransfer: z
    .object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      ifscOrSwift: z.string().optional(),
    })
    .optional(),
  upi: z.object({ id: z.string() }).optional(),
  stripe: z.object({ link: z.string().url() }).optional(),
  wise: z.object({ link: z.string().url() }).optional(),
  paypal: z.object({ email: z.string().email() }).optional(),
});

export const invoiceInputSchema = z.object({
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
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
  project: z.object({
    name: z.string(),
    id: z.string().optional(),
    description: z.string().optional(),
  }),
  invoice: z.object({
    number: z.string(),
    issueDate: z.string(), // ISO yyyy-mm-dd
    dueDate: z.string(),
    status: z.string().optional(),
    referenceNumber: z.string().optional(),
    paymentTerms: z.string().optional(),
  }),
  currency: z.string().min(1), // ISO code e.g. "USD", "INR"
  items: z.array(itemInputSchema).min(1, "At least one invoice item is required"),
  discount: z
    .object({
      type: z.enum(["percent", "fixed"]),
      value: z.number().nonnegative(),
    })
    .optional(),
  tax: z
    .object({
      name: z.string().optional(), // e.g. "GST", "VAT"
      rate: z.number().nonnegative(), // percent
    })
    .optional(),
  payment: paymentMethodSchema.optional(),
  amountPaid: z.number().nonnegative().optional(),
  notes: z.string().optional(), // optional manual override of generated notes
});

export type InvoiceInput = z.infer<typeof invoiceInputSchema>;
export type ItemInput = z.infer<typeof itemInputSchema>;

/* ------------------------------------------------------------------ *
 * AGENT OUTPUT — the ONLY thing Claude produces. Prose, never numbers.
 * ------------------------------------------------------------------ */

export const agentOutputSchema = z.object({
  items: z
    .array(
      z.object({
        // 1:1 with input items, same order
        premiumDescription: z.string(),
      }),
    )
    .describe("Premium rewrites, one per input item, in the same order"),
  notes: z.string(),
  email: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export type AgentOutput = z.infer<typeof agentOutputSchema>;

/* ------------------------------------------------------------------ *
 * FINAL PACKAGE — exact shape consumed by PDF + email services.
 * ------------------------------------------------------------------ */

export interface InvoicePackage {
  validation: { success: boolean; errors: string[] };
  invoice: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    currency: string;
    projectId: string;
    referenceNumber: string;
    paymentTerms: string;
  };
  company: InvoiceInput["company"];
  client: InvoiceInput["client"];
  project: InvoiceInput["project"];
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  summary: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    remaining: number;
  };
  payment: {
    methods: string[];
    instructions: string;
    details: InvoiceInput["payment"];
  };
  notes: string;
  email: { subject: string; body: string };
}
