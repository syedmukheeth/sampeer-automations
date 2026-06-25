import { NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk";

/**
 * GET /api/invoices/:runId
 * Polled by the frontend until the run is COMPLETED/FAILED. Returns the
 * task output (full invoice package incl. pdfBase64) when finished.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  try {
    const run = await runs.retrieve(runId);
    return NextResponse.json({
      status: run.status, // QUEUED | EXECUTING | COMPLETED | FAILED | ...
      isCompleted: run.status === "COMPLETED",
      isFailed: ["FAILED", "CRASHED", "CANCELED", "TIMED_OUT"].includes(run.status),
      output: run.output ?? null,
      error: run.error ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
}
