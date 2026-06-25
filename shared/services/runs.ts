import { runs } from "@trigger.dev/sdk";

/**
 * RUN STORE - the platform's source of truth for execution history & metrics.
 *
 * Phase 2 implementation reads Trigger.dev's own run history (every task run is
 * already persisted there), so the dashboard shows REAL data with zero extra
 * infra. The public surface below is storage-agnostic: if durable retention or
 * custom metrics are needed later, swap the internals for a database without
 * touching any caller.
 *
 * Server-only (uses TRIGGER_SECRET_KEY). Never import from a client component.
 */

/** Normalized, serializable run record (safe to pass server -> client). */
export type RunRecord = {
  id: string;
  task: string;
  status: "completed" | "failed" | "running" | "queued" | "canceled";
  createdAt: string; // ISO
  durationMs: number;
  costInCents: number;
  tags: string[];
  client?: string;
  invoiceNumber?: string;
};

export type RunMetrics = {
  total: number;
  success: number;
  failed: number;
  running: number;
  successRate: number; // 0-100
  avgRuntimeMs: number;
  costInCents: number;
  recent: RunRecord[];
  daily: { label: string; count: number }[]; // last 14 days
};

const INVOICE_TASK = "generate-invoice";

type RawRun = {
  id: string;
  taskIdentifier: string;
  isSuccess: boolean;
  isFailed: boolean;
  isExecuting: boolean;
  isQueued: boolean;
  isCancelled: boolean;
  createdAt: Date;
  durationMs: number;
  costInCents: number;
  tags: string[];
};

function tagValue(tags: string[], prefix: string): string | undefined {
  const hit = tags.find((t) => t.startsWith(`${prefix}:`));
  return hit ? hit.slice(prefix.length + 1) : undefined;
}

function normalize(run: RawRun): RunRecord {
  const status: RunRecord["status"] = run.isSuccess
    ? "completed"
    : run.isFailed
      ? "failed"
      : run.isCancelled
        ? "canceled"
        : run.isExecuting
          ? "running"
          : "queued";
  return {
    id: run.id,
    task: run.taskIdentifier,
    status,
    createdAt: run.createdAt.toISOString(),
    durationMs: run.durationMs ?? 0,
    costInCents: run.costInCents ?? 0,
    tags: run.tags ?? [],
    client: tagValue(run.tags ?? [], "client"),
    // Document reference - invoice or proposal number, whichever tagged it.
    invoiceNumber: tagValue(run.tags ?? [], "invoice") ?? tagValue(run.tags ?? [], "proposal"),
  };
}

/**
 * List recent runs for a task (default: invoice generator). Returns [] on any
 * error (missing key, network) so callers/UI never crash.
 */
export async function listRuns(
  taskIdentifier: string = INVOICE_TASK,
  max = 50,
): Promise<RunRecord[]> {
  const out: RunRecord[] = [];
  try {
    for await (const run of runs.list({ limit: 100 })) {
      const r = run as unknown as RawRun;
      if (r.taskIdentifier !== taskIdentifier) continue;
      out.push(normalize(r));
      if (out.length >= max) break;
    }
  } catch {
    return [];
  }
  return out;
}

/** Aggregate metrics for a task's runs. */
export async function getRunMetrics(
  taskIdentifier: string = INVOICE_TASK,
): Promise<RunMetrics> {
  const records = await listRuns(taskIdentifier, 200);

  const success = records.filter((r) => r.status === "completed").length;
  const failed = records.filter((r) => r.status === "failed").length;
  const running = records.filter((r) => r.status === "running" || r.status === "queued").length;
  const finished = success + failed;

  const completedDurations = records
    .filter((r) => r.status === "completed" && r.durationMs > 0)
    .map((r) => r.durationMs);
  const avgRuntimeMs = completedDurations.length
    ? Math.round(completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length)
    : 0;

  return {
    total: records.length,
    success,
    failed,
    running,
    successRate: finished ? Math.round((success / finished) * 100) : 0,
    avgRuntimeMs,
    costInCents: records.reduce((a, r) => a + r.costInCents, 0),
    recent: records.slice(0, 8),
    daily: buildDailyBuckets(records, 14),
  };
}

/** Group runs into per-day counts for the last `days` days (oldest -> newest). */
function buildDailyBuckets(
  records: RunRecord[],
  days: number,
): { label: string; count: number }[] {
  const buckets: { label: string; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = records.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    buckets.push({ label: `${d.getDate()}`, count });
  }
  return buckets;
}

/** Human "2m ago" style - server-safe (also in shared/lib/format for client). */
export function runTimeAgo(iso: string): string {
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/** Format ms as "14.6s" / "1.2m". */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "-";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${(s / 60).toFixed(1)}m`;
}
