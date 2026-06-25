import { VideoFactoryView } from "@features/content-os/video-factory/components/VideoFactoryView";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function VideoFactoryPage() {
  if (!(await isInstalled("video-factory"))) {
    return <InstallRequired slug="video-factory" name="Video Factory" />;
  }
  return <VideoFactoryView />;
}
