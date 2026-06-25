import { ProjectDashboardView } from "@features/business-os/project-dashboard/components/ProjectDashboardView";
import { listProjects } from "@features/business-os/project-dashboard/service";
import { isInstalled } from "@shared/services/installs";
import { InstallRequired } from "@shared/ui/InstallRequired";

export const dynamic = "force-dynamic";

export default async function ProjectDashboardPage() {
  if (!(await isInstalled("project-dashboard"))) {
    return <InstallRequired slug="project-dashboard" name="Project Dashboard" />;
  }
  const projects = await listProjects();
  return <ProjectDashboardView initial={projects} />;
}
