import type { ReactNode } from "react";
import { MobileNav, Sidebar } from "@shared/navigation/Sidebar";
import { Topbar } from "@shared/navigation/Topbar";
import { installedSlugs } from "@shared/services/installs";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const installed = await installedSlugs();
  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar installed={installed} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileNav installed={installed} />
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          <div className="mx-auto w-full max-w-[98rem] px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
