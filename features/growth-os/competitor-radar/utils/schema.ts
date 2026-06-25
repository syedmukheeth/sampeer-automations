import { z } from "zod";

export const THREAT_LEVELS = ["low", "medium", "high"] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

export const competitorSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  url: z.string().optional().default(""),
  pricing: z.string().optional().default(""), // free text e.g. "$49/mo"
  positioning: z.string().optional().default(""), // their angle
  strengths: z.string().optional().default(""),
  weaknesses: z.string().optional().default(""),
  threat: z.enum(THREAT_LEVELS).default("medium"),
  notes: z.string().optional().default(""),
  createdAt: z.string(),
});

export type Competitor = z.infer<typeof competitorSchema>;

/** Shape accepted from the form for create/update (id optional = create). */
export const competitorInputSchema = competitorSchema
  .partial()
  .extend({ name: z.string().min(1, "Name is required") });

export type CompetitorInput = z.infer<typeof competitorInputSchema>;
