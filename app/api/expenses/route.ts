import { triggerExpenseReport } from "@features/business-os/expense-tracker/api/handlers";

/** POST /api/expenses - delegates to the Expense Tracker feature. */
export function POST(req: Request) {
  return triggerExpenseReport(req);
}
