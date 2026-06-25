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
        description="Every module across the platform. Enable what you need — future automations install with one click."
      />

      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="live" dot>{countByStatus("live")} live</StatusBadge>
        <StatusBadge tone="soon" dot>{countByStatus("soon")} coming soon</StatusBadge>
      </div>

      {operatingSystems.map((os) => {
        const OsIcon = os.icon;
        return (
          <section key={os.id}>
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${os.accent} text-white shadow-soft`}>
                <OsIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink">{os.name}</h2>
                <p className="text-xs text-muted">{os.tagline} · {osAutomationCount(os)} automations</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      icon={<Icon className="h-6 w-6" strokeWidth={2} />}
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
