"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role } from "@shared/services/auth";

const RoleContext = createContext<Role>("owner");

/** Wrap the authenticated app so client components can read the session role. */
export function RoleProvider({ role, children }: { role: Role; children: ReactNode }) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

/** Current session role on the client. Defaults to "owner" if no provider. */
export function useRole(): Role {
  return useContext(RoleContext);
}

/** True when the signed-in user is the limited admin (not the founder). */
export function useIsAdmin(): boolean {
  return useContext(RoleContext) === "admin";
}

/** Render children only for the owner; admins see `fallback` (default null). */
export function OwnerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useRole() === "owner" ? <>{children}</> : <>{fallback}</>;
}
