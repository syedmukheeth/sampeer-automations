import { GrowthAnalyticsView } from "@features/growth-os/analytics/components/GrowthAnalyticsView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!(await isInstalled("analytics"))) {
    return <InstallRequired slug="analytics" name="Growth Analytics" />;
  }
  return <GrowthAnalyticsView />;
}
