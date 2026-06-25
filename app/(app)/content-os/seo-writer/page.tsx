import { SeoWriterView } from "@features/content-os/seo-writer/components/SeoWriterView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function SeoWriterPage() {
  if (!(await isInstalled("seo-writer"))) {
    return <InstallRequired slug="seo-writer" name="SEO Writer" />;
  }
  return <SeoWriterView />;
}
