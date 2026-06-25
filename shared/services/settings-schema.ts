import { z } from "zod";

/**
 * Settings SCHEMA + types — client-safe (no fs/store imports), so client
 * components (the Settings form) can import constants/types without pulling the
 * Node-only store into the browser bundle. Runtime get/save live in settings.ts.
 */

export const PROMPT_VERSIONS = ["v1", "v2"] as const;
export type PromptVersion = (typeof PROMPT_VERSIONS)[number];

export const brandingSchema = z.object({
  companyName: z.string().default("Sampeer Studio"),
  companyAddress: z.string().default(""),
  companyEmail: z.string().default(""),
  companyPhone: z.string().default(""),
  logoUrl: z.string().default(""),
  accentColor: z.string().default("#6366F1"), // hex
  invoiceFooter: z.string().default("Thank you for your business"),
  emailSignatureName: z.string().default(""),
});

export const invoiceSettingsSchema = z.object({
  defaultCurrency: z.string().default("USD"),
  invoicePrefix: z.string().default("INV-"),
  taxName: z.string().default("Tax"),
  taxRate: z.number().min(0).default(0),
  paymentTermsDefault: z.string().default("Net 15"),
  promptVersion: z.enum(PROMPT_VERSIONS).default("v1"),
});

export const settingsSchema = z.object({
  branding: brandingSchema,
  invoice: invoiceSettingsSchema,
});

export type Branding = z.infer<typeof brandingSchema>;
export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;
