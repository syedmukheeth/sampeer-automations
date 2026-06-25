import { RepurposeEngineView } from "@features/content-os/repurpose-engine/components/RepurposeEngineView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function RepurposeEnginePage() {
  if (!(await isInstalled("repurpose-engine"))) {
    return <InstallRequired slug="repurpose-engine" name="Repurpose Engine" />;
  }
  return <RepurposeEngineView />;
}
