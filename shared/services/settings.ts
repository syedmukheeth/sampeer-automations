import { kvGet, kvSet } from "./store";
import { settingsSchema, type Settings } from "./settings-schema";

/**
 * PLATFORM SETTINGS — owner-level configuration (single owner). Runtime layer.
 *
 * White-label branding + per-automation defaults that let the same automation
 * be reskinned for different clients WITHOUT touching code. Stored via the kv
 * store; defaults are seeded from env so an unconfigured install still works.
 *
 * Server-only (imports the fs-backed store). The invoice worker never reads
 * this — the Next API injects the relevant branding into the task payload.
 */

// Re-export schema + types so callers have a single import surface.
export * from "./settings-schema";

const SETTINGS_KEY = "settings";

/** Defaults seeded from env so an unconfigured install matches today's behaviour. */
function defaults(): Settings {
  return settingsSchema.parse({
    branding: {
      companyName: process.env.COMPANY_NAME ?? "Sampeer Studio",
      companyAddress: process.env.COMPANY_ADDRESS ?? "",
      companyEmail: process.env.GMAIL_FROM ?? process.env.RESEND_FROM ?? "",
      companyPhone: process.env.COMPANY_PHONE ?? "",
      logoUrl: process.env.COMPANY_LOGO_URL ?? "",
      accentColor: "#6366F1",
      invoiceFooter: "Thank you for your business",
      emailSignatureName: process.env.COMPANY_NAME ?? "Sampeer Studio",
    },
    invoice: {},
  });
}

/** Current settings: stored values merged over defaults (forward-compatible). */
export async function getSettings(): Promise<Settings> {
  const base = defaults();
  const stored = await kvGet<Partial<Settings>>(SETTINGS_KEY);
  if (!stored) return base;
  return settingsSchema.parse({
    branding: { ...base.branding, ...(stored.branding ?? {}) },
    invoice: { ...base.invoice, ...(stored.invoice ?? {}) },
  });
}

/**
 * Persist a (partial) settings update. Validates, merges over current, writes.
 * Returns the saved settings and whether it was durably persisted.
 */
export async function saveSettings(
  patch: unknown,
): Promise<{ settings: Settings; persisted: boolean }> {
  const current = await getSettings();
  const input = (patch ?? {}) as Partial<Settings>;
  const next = settingsSchema.parse({
    branding: { ...current.branding, ...(input.branding ?? {}) },
    invoice: { ...current.invoice, ...(input.invoice ?? {}) },
  });
  const persisted = await kvSet(SETTINGS_KEY, next);
  return { settings: next, persisted };
}
