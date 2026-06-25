import { getExpenseRun } from "@features/business-os/expense-tracker/api/handlers";

/** GET /api/expenses/:runId - delegates to the Expense Tracker feature. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  return getExpenseRun(runId);
}
