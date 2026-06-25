import { CompetitorRadarView } from "@features/growth-os/competitor-radar/components/CompetitorRadarView";
import { listCompetitors } from "@features/growth-os/competitor-radar/service";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function CompetitorRadarPage() {
  if (!(await isInstalled("competitors"))) {
    return <InstallRequired slug="competitors" name="Competitor Radar" />;
  }
  const competitors = await listCompetitors();
  return <CompetitorRadarView initial={competitors} />;
}
