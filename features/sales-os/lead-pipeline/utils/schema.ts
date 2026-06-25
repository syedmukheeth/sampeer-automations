import { z } from "zod";

export const LEAD_STAGES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const leadSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional().default(""),
  email: z.string().optional().default(""),
  source: z.string().optional().default(""), // where the lead came from
  owner: z.string().optional().default(""), // rep responsible
  stage: z.enum(LEAD_STAGES).default("new"),
  value: z.number().nonnegative().default(0), // potential deal value
  nextStep: z.string().optional().default(""),
  lastActivity: z.string().optional().default(""), // ISO yyyy-mm-dd
  notes: z.string().optional().default(""),
  createdAt: z.string(),
});

export type Lead = z.infer<typeof leadSchema>;

/** Shape accepted from the form for create/update (id optional = create). */
export const leadInputSchema = leadSchema
  .partial()
  .extend({ name: z.string().min(1, "Name is required") });

export type LeadInput = z.infer<typeof leadInputSchema>;
