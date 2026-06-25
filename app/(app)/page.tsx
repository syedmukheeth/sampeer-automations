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
} from "lucide-react";
import { StatCard } from "@shared/ui/StatCard";
import { ChartCard } from "@shared/ui/ChartCard";
import { Card } from "@shared/ui/Card";
import { SectionHeader } from "@shared/ui/SectionHeader";
import { EmptyState } from "@shared/ui/EmptyState";
import { ActivityTimeline, type ActivityItem } from "@shared/ui/ActivityCard";
import { LineChart } from "@shared/charts/LineChart";
import { countByStatus, liveAutomations } from "@features/registry";
import { getRunMetrics, runTimeAgo, formatDuration, type RunRecord } from "@shared/services/runs";
import { installedSlugs } from "@shared/services/installs";

// Real execution data from the run store (Trigger.dev). Re-fetched per request.
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
    meta: ["Invoice Generator", r.client].filter(Boolean).join(" · "),
    time: runTimeAgo(r.createdAt),
    tone: TONE[r.status],
  }));

  const hasRuns = metrics.total > 0;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="animate-fade-up">
        <p className="text-sm font-medium text-muted">Welcome back 👋</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
          Today&rsquo;s overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          {live} live · {soon} in the pipeline across BusinessOS, ContentOS, SalesOS &amp; GrowthOS.
        </p>
      </header>

      {/* KPI grid — real metrics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Executions" value={String(metrics.total)} hint={`${metrics.running} running now`} icon={<Activity className="h-5 w-5" />} accent="from-indigo-500 to-violet-600" />
        <StatCard index={1} label="Installed" value={String(live)} hint={`${soon} in marketplace`} icon={<Zap className="h-5 w-5" />} accent="from-fuchsia-500 to-pink-600" />
        <StatCard index={2} label="Success Rate" value={hasRuns ? `${metrics.successRate}%` : "—"} hint={`${metrics.success} ok · ${metrics.failed} failed`} icon={<Gauge className="h-5 w-5" />} accent="from-emerald-500 to-teal-600" />
        <StatCard index={3} label="Avg Runtime" value={formatDuration(metrics.avgRuntimeMs)} hint="completed runs" icon={<Timer className="h-5 w-5" />} accent="from-amber-500 to-orange-600" />
      </section>

      {/* Chart + activity */}
      <section className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title="Executions"
          subtitle="Invoice runs · last 14 days"
        >
          {hasRuns ? (
            <LineChart
              data={metrics.daily.map((d) => d.count)}
              labels={metrics.daily.filter((_, i) => i % 2 === 0).map((d) => d.label)}
              height={220}
            />
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted">
              No runs yet — generate an invoice to see live data here.
            </div>
          )}
        </ChartCard>

        <Card className="p-5 sm:p-6">
          <SectionHeader title="Recent Activity" />
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

      {/* Live automations + quick actions */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader
            title="Your Automations"
            action={
              <Link href="/library" className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Library <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {installedAutomations.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.slug} href={a.href}>
                  <Card className="group flex h-full items-start gap-4 p-5 transition-shadow hover:shadow-lift">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${a.accent} text-white shadow-soft`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-ink">{a.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{a.description}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeader title="Quick Actions" />
          <div className="space-y-3">
            <QuickAction href="/business-os/invoice-generator" icon={Receipt} label="Create Invoice" hint="Generate & email a branded PDF" />
            <QuickAction href="/library" icon={FileText} label="Browse Library" hint="Explore every automation" />
            <QuickAction href="/business-os/invoice-generator" icon={BarChart3} label="View Reports" hint="Run output & statistics" />
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
      <Card className="group flex items-center gap-3 p-4 transition-shadow hover:shadow-lift">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-accent">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
}
