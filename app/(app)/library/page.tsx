import { PageHeader } from "@shared/ui/PageHeader";
import { AutomationCard } from "@shared/ui/AutomationCard";
import { StatusBadge } from "@shared/ui/StatusBadge";
import { InstallToggle } from "@shared/ui/InstallToggle";
import { operatingSystems, osAutomationCount, countByStatus } from "@features/registry";
import { getInstalls } from "@shared/services/installs";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const installs = await getInstalls();
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Marketplace"
        title="Automation Library"
        description="Enable the tools you need today and keep future modules visible without cluttering the active workspace."
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="live" dot>{countByStatus("live")} live</StatusBadge>
        <StatusBadge tone="soon" dot>{countByStatus("soon")} coming soon</StatusBadge>
      </div>

      {operatingSystems.map((os) => {
        const OsIcon = os.icon;
        return (
          <section key={os.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-stone-50 text-brand shadow-soft">
                <OsIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">{os.name}</h2>
                <p className="text-sm text-muted">{os.tagline} / {osAutomationCount(os)} automations</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {os.modules.flatMap((m) =>
                m.automations.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <AutomationCard
                      key={a.slug}
                      name={a.name}
                      description={a.description}
                      href={a.href}
                      status={a.status}
                      tags={a.tags}
                      accent={a.accent}
                      icon={<Icon className="h-6 w-6" strokeWidth={1.9} />}
                      action={
                        a.status === "live" ? (
                          <InstallToggle slug={a.slug} installed={installs[a.slug] !== false} />
                        ) : undefined
                      }
                      index={i}
                    />
                  );
                }),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
