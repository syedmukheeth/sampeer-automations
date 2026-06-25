import { ProposalAutomationView } from "@features/business-os/proposal-generator/components/ProposalAutomationView";
import { listRuns, getRunMetrics } from "@shared/services/runs";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

// Real execution history from the run store (Trigger.dev).
export const dynamic = "force-dynamic";

export default async function ProposalGeneratorPage() {
  if (!(await isInstalled("proposal-generator"))) {
    return <InstallRequired slug="proposal-generator" name="Proposal Generator" />;
  }
  const [runs, metrics] = await Promise.all([
    listRuns("generate-proposal"),
    getRunMetrics("generate-proposal"),
  ]);
  return (
    <ProposalAutomationView
      runs={runs}
      metrics={{
        total: metrics.total,
        successRate: metrics.successRate,
        avgRuntimeMs: metrics.avgRuntimeMs,
      }}
    />
  );
}
