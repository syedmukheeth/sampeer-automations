import Link from "next/link";
import { automations, liveCount, type Automation } from "./automations";

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand">Sampeer Automations</h1>
            <p className="text-sm text-slate-500">
              Your control center for every workflow you build.
            </p>
          </div>
          <a
            href="/api/auth/logout"
            className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-brand"
          >
            Sign out
          </a>
        </div>

        <div className="mt-6 flex gap-3">
          <Stat label="Automations" value={String(automations.length)} />
          <Stat label="Live" value={String(liveCount)} accent />
        </div>
      </header>

      {/* Grid */}
      <section className="grid gap-5 sm:grid-cols-2">
        {automations.map((a) => (
          <AutomationCard key={a.slug} automation={a} />
        ))}
        <AddCard />
      </section>

      <footer className="mt-14 text-center text-xs text-slate-400">
        Sampeer Studio
      </footer>
    </main>
  );
}

function AutomationCard({ automation: a }: { automation: Automation }) {
  const card = (
    <div className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${a.accent} text-2xl shadow-sm`}
        >
          {a.icon}
        </div>
        <StatusPill status={a.status} />
      </div>

      <h2 className="mt-4 text-lg font-bold text-brand">{a.name}</h2>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">
        {a.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {a.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
          >
            {t}
          </span>
        ))}
      </div>

      {a.status === "live" && (
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          Open automation
          <span className="transition group-hover:translate-x-0.5">→</span>
        </span>
      )}
    </div>
  );

  return a.status === "live" ? (
    <Link href={a.href} className="block">
      {card}
    </Link>
  ) : (
    <div className="cursor-not-allowed opacity-70">{card}</div>
  );
}

function AddCard() {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-slate-400">
      <div className="text-3xl">＋</div>
      <p className="mt-2 text-sm font-medium">More automations coming</p>
      <p className="mt-1 text-xs">
        Add an entry to <code className="rounded bg-slate-100 px-1">automations.ts</code>
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: Automation["status"] }) {
  const live = status === "live";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        live ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {live ? "Live" : "Soon"}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-4 py-2 ${
        accent ? "border-accent/30 bg-accent/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className={`text-xl font-bold ${accent ? "text-accent" : "text-brand"}`}>
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
