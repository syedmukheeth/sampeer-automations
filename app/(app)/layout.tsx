import type { ReactNode } from "react";
import { Sidebar } from "@shared/navigation/Sidebar";
import { Topbar } from "@shared/navigation/Topbar";
import { installedSlugs } from "@shared/services/installs";

export const dynamic = "force-dynamic";

/** Premium in-app shell: persistent sidebar + top bar around every page. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const installed = await installedSlugs();
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar installed={installed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
