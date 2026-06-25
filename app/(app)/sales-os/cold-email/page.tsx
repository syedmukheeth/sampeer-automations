import { ColdEmailView } from "@features/sales-os/cold-email/components/ColdEmailView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function ColdEmailPage() {
  if (!(await isInstalled("cold-email"))) {
    return <InstallRequired slug="cold-email" name="Cold Email Generator" />;
  }
  return <ColdEmailView />;
}
