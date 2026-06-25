import { LeadPipelineView } from "@features/sales-os/lead-pipeline/components/LeadPipelineView";
import { listLeads } from "@features/sales-os/lead-pipeline/service";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function LeadPipelinePage() {
  if (!(await isInstalled("lead-pipeline"))) {
    return <InstallRequired slug="lead-pipeline" name="Lead Pipeline" />;
  }
  const leads = await listLeads();
  return <LeadPipelineView initial={leads} />;
}
