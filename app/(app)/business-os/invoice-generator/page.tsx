import { InvoiceAutomationView } from "@features/business-os/invoice-generator/components/InvoiceAutomationView";
import { listRuns, getRunMetrics } from "@shared/services/runs";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

// Real execution history from the run store (Trigger.dev).
export const dynamic = "force-dynamic";

export default async function InvoiceGeneratorPage() {
  if (!(await isInstalled("invoice-generator"))) {
    return <InstallRequired slug="invoice-generator" name="Invoice Generator" />;
  }
  const [runs, metrics] = await Promise.all([listRuns(), getRunMetrics()]);
  return (
    <InvoiceAutomationView
      runs={runs}
      metrics={{
        total: metrics.total,
        successRate: metrics.successRate,
        avgRuntimeMs: metrics.avgRuntimeMs,
      }}
    />
  );
}
