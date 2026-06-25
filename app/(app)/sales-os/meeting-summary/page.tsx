import { MeetingSummaryView } from "@features/sales-os/meeting-summary/components/MeetingSummaryView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function MeetingSummaryPage() {
  if (!(await isInstalled("meeting-summary"))) {
    return <InstallRequired slug="meeting-summary" name="Meeting Summary" />;
  }
  return <MeetingSummaryView />;
}
