import Link from "next/link";
import {
  Activity,
  Gauge,
  Timer,
  Zap,
  Receipt,
  FileText,
  BarChart3,
  ArrowRight,
  Plus,
} from "lucide-react";
import { StatCard } from "@shared/ui/StatCard";
import { DemoDataButton } from "@shared/ui/DemoDataButton";
import { ChartCard } from "@shared/ui/ChartCard";
import { Card } from "@shared/ui/Card";
import { SectionHeader } from "@shared/ui/SectionHeader";
import { EmptyState } from "@shared/ui/EmptyState";
import { ActivityTimeline, type ActivityItem } from "@shared/ui/ActivityCard";
import { LineChart } from "@shared/charts/LineChart";
import { countByStatus, liveAutomations } from "@features/registry";
import { getRunMetrics, runTimeAgo, formatDuration, type RunRecord } from "@shared/services/runs";
import { installedSlugs } from "@shared/services/installs";

export const dynamic = "force-dynamic";

const TONE: Record<RunRecord["status"], ActivityItem["tone"]> = {
  completed: "success",
  failed: "failed",
  running: "running",
  queued: "running",
  canceled: "neutral",
};

export default async function OverviewPage() {
  const [metrics, installed] = await Promise.all([getRunMetrics(), installedSlugs()]);
  const installedAutomations = liveAutomations.filter((a) => installed.includes(a.slug));
  const live = installedAutomations.length;
  const soon = countByStatus("soon");

  const activity: ActivityItem[] = metrics.recent.map((r) => ({
    id: r.id,
    title: `${r.invoiceNumber ? `Invoice ${r.invoiceNumber}` : "Invoice run"} ${r.status}`,
    meta: ["Invoice Generator", r.client].filter(Boolean).join(" / "),
    time: runTimeAgo(r.createdAt),
    tone: TONE[r.status],
  }));

  const hasRuns = metrics.total > 0;

  return (
    <div className="space-y-8">
      <header className="grid gap-6 rounded-3xl border border-line/80 bg-panel/88 p-6 shadow-soft backdrop-blur-sm lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Sampeer operations
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Automation control center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Monitor runs, open generators, and keep the installed automation stack ready for client work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DemoDataButton />
          <Link
            href="/business-os/invoice-generator"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            New invoice
          </Link>
          <Link
            href="/library"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-4 text-sm font-semibold text-ink shadow-soft transition hover:border-brand-500"
          >
            Library
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Executions" value={String(metrics.total)} hint={`${metrics.running} running now`} icon={<Activity className="h-5 w-5" />} />
        <StatCard index={1} label="Installed" value={String(live)} hint={`${soon} in marketplace`} icon={<Zap className="h-5 w-5" />} />
        <StatCard index={2} label="Success Rate" value={hasRuns ? `${metrics.successRate}%` : "None"} hint={`${metrics.success} ok / ${metrics.failed} failed`} icon={<Gauge className="h-5 w-5" />} />
        <StatCard index={3} label="Avg Runtime" value={formatDuration(metrics.avgRuntimeMs)} hint="completed runs" icon={<Timer className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_30rem]">
        <ChartCard
          title="Execution volume"
          subtitle="Invoice runs / last 14 days"
        >
          {hasRuns ? (
            <LineChart
              data={metrics.daily.map((d) => d.count)}
              labels={metrics.daily.filter((_, i) => i % 2 === 0).map((d) => d.label)}
              height={260}
            />
          ) : (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted">
              No runs yet. Generate an invoice to see live data here.
            </div>
          )}
        </ChartCard>

        <Card className="p-5 sm:p-6">
          <SectionHeader title="Recent activity" />
          {activity.length ? (
            <ActivityTimeline items={activity} />
          ) : (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="No activity yet"
              description="Executions show up here as automations run."
            />
          )}
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div>
          <SectionHeader
            title="Installed automations"
            action={
              <Link href="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            {installedAutomations.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.slug} href={a.href}>
                  <Card className="group flex h-full items-start gap-4 p-5 transition duration-200 hover:border-brand-500/40 hover:shadow-lift">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-ink">{a.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{a.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeader title="Quick actions" />
          <div className="space-y-3">
            <QuickAction href="/business-os/invoice-generator" icon={Receipt} label="Create invoice" hint="Generate and email a branded PDF" />
            <QuickAction href="/business-os/proposal-generator" icon={FileText} label="Create proposal" hint="Prepare a priced client proposal" />
            <QuickAction href="/business-os/invoice-generator" icon={BarChart3} label="Review runs" hint="Open execution history and logs" />
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof Receipt;
  label: string;
  hint: string;
}) {
  return (
    <Link href={href}>
      <Card className="group flex items-center gap-3 p-4 transition duration-200 hover:border-brand-500/40 hover:shadow-lift">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs leading-5 text-muted">{hint}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
}
