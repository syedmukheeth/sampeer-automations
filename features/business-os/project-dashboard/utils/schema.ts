import { z } from "zod";

export const PROJECT_STATUSES = [
  "kickoff",
  "in_progress",
  "review",
  "delivered",
  "on_hold",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  kickoff: "Kickoff",
  in_progress: "In Progress",
  review: "Review",
  delivered: "Delivered",
  on_hold: "On Hold",
};

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  client: z.string().optional().default(""),
  status: z.enum(PROJECT_STATUSES).default("kickoff"),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().optional().default(""),
  dueDate: z.string().optional().default(""),
  value: z.number().nonnegative().default(0),
  notes: z.string().optional().default(""),
  createdAt: z.string(),
});

export type Project = z.infer<typeof projectSchema>;

export const projectInputSchema = projectSchema
  .partial()
  .extend({ name: z.string().min(1, "Name is required") });

export type ProjectInput = z.infer<typeof projectInputSchema>;
