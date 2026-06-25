import { z } from "zod";

export const CLIENT_STATUSES = ["lead", "active", "paused", "churned"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  status: z.enum(CLIENT_STATUSES).default("lead"),
  value: z.number().nonnegative().default(0), // engagement / account value
  lastContact: z.string().optional().default(""), // ISO yyyy-mm-dd
  notes: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type Client = z.infer<typeof clientSchema>;

/** Shape accepted from the form for create/update (id optional = create). */
export const clientInputSchema = clientSchema
  .partial()
  .extend({ name: z.string().min(1, "Name is required") });

export type ClientInput = z.infer<typeof clientInputSchema>;
