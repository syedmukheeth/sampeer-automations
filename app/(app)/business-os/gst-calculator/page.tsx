import { GstCalculatorView } from "@features/business-os/gst-calculator/components/GstCalculatorView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function GstCalculatorPage() {
  if (!(await isInstalled("gst-calculator"))) {
    return <InstallRequired slug="gst-calculator" name="GST / Tax Calculator" />;
  }
  return <GstCalculatorView />;
}
