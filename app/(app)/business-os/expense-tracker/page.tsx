import { ExpenseAutomationView } from "@features/business-os/expense-tracker/components/ExpenseAutomationView";
import { listRuns, getRunMetrics } from "@shared/services/runs";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

// Real execution history from the run store (Trigger.dev).
export const dynamic = "force-dynamic";

export default async function ExpenseTrackerPage() {
  if (!(await isInstalled("expense-tracker"))) {
    return <InstallRequired slug="expense-tracker" name="Expense Tracker" />;
  }
  const [runs, metrics] = await Promise.all([
    listRuns("track-expenses"),
    getRunMetrics("track-expenses"),
  ]);
  return (
    <ExpenseAutomationView
      runs={runs}
      metrics={{
        total: metrics.total,
        successRate: metrics.successRate,
        avgRuntimeMs: metrics.avgRuntimeMs,
      }}
    />
  );
}
