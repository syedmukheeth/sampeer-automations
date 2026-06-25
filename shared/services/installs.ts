import { kvGet, kvSet } from "./store";
import { liveAutomations, getAutomation } from "@features/registry";

/**
 * INSTALL / ENABLE STORE - the marketplace mechanic of the SaaS layer.
 *
 * Tracks which automations are "installed" (enabled) for this workspace. Live
 * automations default to installed; the Library lets the owner toggle them.
 * The shell (sidebar, dashboard) only surfaces installed automations, and each
 * automation page gates on install state.
 *
 * Backed by the same kv store (file -> swap for KV/Redis in prod). Currently
 * single-workspace; key this by tenant/org id to go multi-tenant later - that
 * is the only change needed for per-customer installs.
 *
 * Server-only.
 */

export type InstallState = Record<string, boolean>; // slug -> enabled

const KEY = "installs";

/** Full install map: live automations default true, stored overrides applied. */
export async function getInstalls(): Promise<InstallState> {
  const base: InstallState = {};
  for (const a of liveAutomations) base[a.slug] = true;
  const stored = await kvGet<InstallState>(KEY);
  return { ...base, ...(stored ?? {}) };
}

/** Slugs of installed automations. */
export async function installedSlugs(): Promise<string[]> {
  const state = await getInstalls();
  return Object.entries(state)
    .filter(([, on]) => on)
    .map(([slug]) => slug);
}

/** Is this automation installed? (Only live automations can be installed.) */
export async function isInstalled(slug: string): Promise<boolean> {
  const a = getAutomation(slug);
  if (!a || a.status !== "live") return false;
  const state = await getInstalls();
  return state[slug] !== false;
}

/** Toggle an automation's installed state. Returns new map + persistence flag. */
export async function setInstalled(
  slug: string,
  enabled: boolean,
): Promise<{ state: InstallState; persisted: boolean }> {
  const current = await getInstalls();
  const next = { ...current, [slug]: enabled };
  const persisted = await kvSet(KEY, next);
  return { state: next, persisted };
}
