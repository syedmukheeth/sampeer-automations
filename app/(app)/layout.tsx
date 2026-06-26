import type { ReactNode } from "react";
import { MobileNav, Sidebar } from "@shared/navigation/Sidebar";
import { Topbar } from "@shared/navigation/Topbar";
import { PageTransition } from "@shared/ui/PageTransition";
import { RoleProvider } from "@shared/ui/RoleContext";
import { installedSlugs } from "@shared/services/installs";
import { currentSession } from "@shared/services/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [installed, session] = await Promise.all([installedSlugs(), currentSession()]);
  const role = session?.role ?? "owner";
  return (
    <RoleProvider role={role}>
      <div className="flex h-dvh overflow-hidden bg-canvas">
        <Sidebar installed={installed} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileNav installed={installed} />
          <Topbar username={session?.username ?? ""} role={role} />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            <div className="mx-auto w-full max-w-[98rem] px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
