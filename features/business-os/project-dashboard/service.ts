import { kvGet, kvSet } from "@shared/services/store";
import { projectInputSchema, projectSchema, type Project } from "./utils/schema";

/**
 * Project store. Backed by the platform kv adapter (JSON file locally; swap for
 * KV/Redis in prod). Single-workspace. Server-only.
 */

const KEY = "projects";

export async function listProjects(): Promise<Project[]> {
  const raw = (await kvGet<Project[]>(KEY)) ?? [];
  return raw
    .map((p) => projectSchema.safeParse(p))
    .filter((r): r is { success: true; data: Project } => r.success)
    .map((r) => r.data)
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
}

export async function saveProject(
  input: unknown,
): Promise<{ project: Project; persisted: boolean }> {
  const parsed = projectInputSchema.parse(input);
  const projects = await listProjects();

  let project: Project;
  if (parsed.id) {
    const existing = projects.find((p) => p.id === parsed.id);
    project = projectSchema.parse({
      ...(existing ?? { createdAt: new Date().toISOString() }),
      ...parsed,
      id: parsed.id,
    });
  } else {
    project = projectSchema.parse({
      ...parsed,
      id: projId(),
      createdAt: new Date().toISOString(),
    });
  }

  const next = parsed.id
    ? projects.map((p) => (p.id === project.id ? project : p))
    : [...projects, project];
  if (parsed.id && !next.some((p) => p.id === project.id)) next.push(project);

  const persisted = await kvSet(KEY, next);
  return { project, persisted };
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await listProjects();
  return kvSet(KEY, projects.filter((p) => p.id !== id));
}

function projId(): string {
  return `pr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
