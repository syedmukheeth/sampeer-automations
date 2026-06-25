import { ClientCrmView } from "@features/business-os/client-crm/components/ClientCrmView";
import { listClients } from "@features/business-os/client-crm/service";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function ClientCrmPage() {
  if (!(await isInstalled("client-crm"))) {
    return <InstallRequired slug="client-crm" name="Client CRM" />;
  }
  const clients = await listClients();
  return <ClientCrmView initial={clients} />;
}
