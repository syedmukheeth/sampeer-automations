import { NextResponse } from "next/server";
import { tasks, runs } from "@trigger.dev/sdk";
import type { trackExpenses } from "../trigger/track-expenses";
import { expenseInputSchema, type ExpenseInput } from "../utils/schema";
import { getSettings } from "@shared/services/settings";

const orUndef = (v?: string) => (v && v.trim() ? v : undefined);

/**
 * Apply platform settings (white-label branding + default currency) to a
 * validated payload. Form values always win; settings fill the gaps. Keeps the
 * Trigger worker stateless - branding travels in the payload.
 */
async function applySettings(data: ExpenseInput): Promise<ExpenseInput> {
  const { branding: b, invoice: inv } = await getSettings();
  return {
    ...data,
    report: {
      ...data.report,
      currency: data.report.currency || inv.defaultCurrency,
    },
    branding: {
      accentColor: b.accentColor,
      invoiceFooter: b.invoiceFooter,
      emailSignatureName: orUndef(b.emailSignatureName) ?? b.companyName,
      logoUrl: orUndef(b.logoUrl),
    },
    promptVersion: data.promptVersion ?? inv.promptVersion,
  };
}

/** POST: validate shape, trigger the task server-side, return the run id. */
export async function triggerExpenseReport(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = expenseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    const payload = await applySettings(parsed.data);
    const handle = await tasks.trigger<typeof trackExpenses>("track-expenses", payload, {
      tags: [`expense:${payload.report.name}`, `period:${payload.report.periodStart}`],
    });

    return NextResponse.json({ runId: handle.id });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Unable to queue expense run. Check Vercel TRIGGER_SECRET_KEY and Trigger.dev deployment.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}

/** GET: poll run status/output until COMPLETED/FAILED. */
export async function getExpenseRun(runId: string): Promise<NextResponse> {
  try {
    const run = await runs.retrieve(runId);
    return NextResponse.json({
      status: run.status,
      isCompleted: run.status === "COMPLETED",
      isFailed: ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT"].includes(run.status),
      output: run.output ?? null,
      error: run.error ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
}
