import { TrendHunterView } from "@features/content-os/trend-hunter/components/TrendHunterView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function TrendHunterPage() {
  if (!(await isInstalled("trend-hunter"))) {
    return <InstallRequired slug="trend-hunter" name="Trend Hunter" />;
  }
  return <TrendHunterView />;
}
