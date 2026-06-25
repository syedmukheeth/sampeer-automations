import { WebsiteHealthView } from "@features/growth-os/website-health/components/WebsiteHealthView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function WebsiteHealthPage() {
  if (!(await isInstalled("website-health"))) {
    return <InstallRequired slug="website-health" name="Website Health" />;
  }
  return <WebsiteHealthView />;
}
