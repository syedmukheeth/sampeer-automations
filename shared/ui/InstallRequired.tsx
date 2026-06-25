import { PackageOpen } from "lucide-react";
import { Card } from "./Card";
import { InstallToggle } from "./InstallToggle";

/** Shown in place of an automation when it isn't installed for this workspace. */
export function InstallRequired({ slug, name }: { slug: string; name: string }) {
  return (
    <Card className="mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-accent">
        <PackageOpen className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-ink">{name} isn&rsquo;t installed</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Install this automation to run it and surface it in your sidebar and dashboard.
        You can uninstall any time from the Library.
      </p>
      <div className="mt-5">
        <InstallToggle slug={slug} installed={false} size="lg" />
      </div>
    </Card>
  );
}
