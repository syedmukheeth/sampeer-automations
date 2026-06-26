import { KeyRound, CreditCard, ScrollText } from "lucide-react";
import { PageHeader } from "@shared/ui/PageHeader";
import { Card } from "@shared/ui/Card";
import { StatusBadge } from "@shared/ui/StatusBadge";
import { SectionHeader } from "@shared/ui/SectionHeader";
import { redirect } from "next/navigation";
import { getSettings } from "@shared/services/settings";
import { currentSession } from "@shared/services/session";
import { readAudit } from "@shared/services/audit";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

const SCAFFOLD = [
  { icon: KeyRound, title: "API Keys", body: "Trigger.dev, Gemini, Composio, and Resend credentials." },
  { icon: CreditCard, title: "Billing", body: "Plan, usage, and invoices for the platform itself." },
  { icon: ScrollText, title: "Logs", body: "Platform-wide execution and audit logs." },
];

export default async function SettingsPage() {
  const session = await currentSession();
  if (session?.role !== "owner") redirect("/");
  const [settings, audit] = await Promise.all([getSettings(), readAudit(20)]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        description="Branding and automation defaults apply across runs - no code edits needed to reskin for a client."
      />

      <SettingsForm initial={settings} />

      <section>
        <SectionHeader title="Recent changes" />
        <Card className="p-6">
          {audit.length === 0 ? (
            <p className="text-sm text-muted">No changes recorded yet.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {audit.map((e, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.role === "owner" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {e.user} ({e.role})
                  </span>
                  <span className="font-medium text-ink">{e.action}</span>
                  <span className="text-muted">{e.resource}{e.id ? ` · ${e.id}` : ""}</span>
                  <span className="ml-auto text-xs text-muted/70">
                    {new Date(e.at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <SectionHeader title="More" />
        <div className="grid gap-4 sm:grid-cols-3">
          {SCAFFOLD.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="flex items-start gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-100 bg-brand-50 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-ink">{s.title}</h3>
                    <StatusBadge tone="soon">Soon</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{s.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
