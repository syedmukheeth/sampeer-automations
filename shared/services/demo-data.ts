import "server-only";
import { kvGet, kvSet } from "./store";

/**
 * One-click demo data for client walkthroughs.
 *
 * Records are tagged with `demo_` ids so seeding is additive and clearing only
 * removes the demo rows — any real data the owner has entered is preserved.
 * `seedDemo()` is idempotent (re-seeding replaces the same demo ids).
 */

type WithId = { id: string };

const D = "demo_"; // id prefix marking a demo record

const DEMO_CLIENTS = [
  { id: `${D}cl_apex`, name: "Priya Sharma", company: "Apex Retail", email: "priya@apexretail.com", phone: "+91 98200 11223", status: "active", value: 48000, lastContact: "2026-06-18", notes: "Renewing annual retainer; upsell analytics.", tags: ["retainer", "priority"], createdAt: "2026-01-12T09:00:00.000Z" },
  { id: `${D}cl_northwind`, name: "James Okoro", company: "Northwind Labs", email: "james@northwind.io", phone: "+44 20 7946 0123", status: "active", value: 72000, lastContact: "2026-06-21", notes: "Quarterly content + paid social.", tags: ["content", "ads"], createdAt: "2025-11-03T09:00:00.000Z" },
  { id: `${D}cl_lumen`, name: "Sofia Rossi", company: "Lumen Studio", email: "sofia@lumen.studio", phone: "+39 06 9480 1122", status: "lead", value: 15000, lastContact: "2026-06-10", notes: "Pilot project; deciding scope.", tags: ["pilot"], createdAt: "2026-05-20T09:00:00.000Z" },
  { id: `${D}cl_vertex`, name: "Daniel Müller", company: "Vertex Logistics", email: "daniel@vertexlog.de", phone: "+49 30 1234 5678", status: "paused", value: 30000, lastContact: "2026-04-02", notes: "On hold pending budget cycle.", tags: ["paused"], createdAt: "2025-09-15T09:00:00.000Z" },
  { id: `${D}cl_coral`, name: "Aisha Khan", company: "Coral Beauty", email: "aisha@coralbeauty.co", phone: "+971 4 555 0199", status: "active", value: 26000, lastContact: "2026-06-24", notes: "Influencer campaign Q3.", tags: ["ecom"], createdAt: "2026-02-28T09:00:00.000Z" },
];

const DEMO_LEADS = [
  { id: `${D}ld_brightwave`, name: "Marcus Lee", company: "Brightwave SaaS", email: "marcus@brightwave.app", source: "Referral", owner: "Sampeer", stage: "qualified", value: 60000, nextStep: "Send proposal", lastActivity: "2026-06-22", notes: "Wants full GrowthOS rollout.", createdAt: "2026-06-01T09:00:00.000Z" },
  { id: `${D}ld_summit`, name: "Elena Petrova", company: "Summit Fitness", email: "elena@summitfit.com", source: "Cold email", owner: "Sampeer", stage: "proposal", value: 24000, nextStep: "Follow up Tue", lastActivity: "2026-06-20", notes: "Comparing two agencies.", createdAt: "2026-05-25T09:00:00.000Z" },
  { id: `${D}ld_orbit`, name: "Tom Becker", company: "Orbit Media", email: "tom@orbitmedia.tv", source: "LinkedIn", owner: "Sampeer", stage: "contacted", value: 18000, nextStep: "Book discovery call", lastActivity: "2026-06-19", notes: "Replied positive to outreach.", createdAt: "2026-06-12T09:00:00.000Z" },
  { id: `${D}ld_finch`, name: "Grace Wong", company: "Finch Financial", email: "grace@finchfin.com", source: "Webinar", owner: "Sampeer", stage: "new", value: 90000, nextStep: "Qualify budget", lastActivity: "2026-06-23", notes: "Enterprise; long cycle.", createdAt: "2026-06-23T09:00:00.000Z" },
  { id: `${D}ld_kiln`, name: "Omar Haddad", company: "Kiln Ceramics", email: "omar@kiln.shop", source: "Referral", owner: "Sampeer", stage: "won", value: 12000, nextStep: "Kickoff", lastActivity: "2026-06-15", notes: "Signed — onboard now.", createdAt: "2026-05-02T09:00:00.000Z" },
];

const DEMO_PROJECTS = [
  { id: `${D}pj_apex`, name: "Apex Retail — Q3 Campaign", client: "Apex Retail", status: "in_progress", progress: 65, startDate: "2026-05-01", dueDate: "2026-07-31", value: 48000, notes: "Creative approved; ads live.", createdAt: "2026-05-01T09:00:00.000Z" },
  { id: `${D}pj_northwind`, name: "Northwind — Content Engine", client: "Northwind Labs", status: "in_progress", progress: 40, startDate: "2026-06-01", dueDate: "2026-08-15", value: 72000, notes: "12 articles/mo pipeline.", createdAt: "2026-06-01T09:00:00.000Z" },
  { id: `${D}pj_coral`, name: "Coral Beauty — Influencer Push", client: "Coral Beauty", status: "kickoff", progress: 10, startDate: "2026-06-20", dueDate: "2026-09-01", value: 26000, notes: "Sourcing creators.", createdAt: "2026-06-20T09:00:00.000Z" },
  { id: `${D}pj_kiln`, name: "Kiln — Brand Launch", client: "Kiln Ceramics", status: "delivered", progress: 100, startDate: "2026-03-01", dueDate: "2026-05-30", value: 12000, notes: "Delivered; case study pending.", createdAt: "2026-03-01T09:00:00.000Z" },
  { id: `${D}pj_vertex`, name: "Vertex — Website Revamp", client: "Vertex Logistics", status: "on_hold", progress: 30, startDate: "2026-04-10", dueDate: "2026-06-30", value: 30000, notes: "Blocked on client assets.", createdAt: "2026-04-10T09:00:00.000Z" },
];

const DEMO_COMPETITORS = [
  { id: `${D}cp_scale`, name: "ScaleUp Agency", url: "scaleup.agency", pricing: "$5k/mo retainer", positioning: "Full-funnel growth for SaaS", strengths: "Strong paid media, big case studies", weaknesses: "Slow turnaround, junior team", threat: "high", notes: "Wins on brand; loses on speed.", createdAt: "2026-01-05T09:00:00.000Z" },
  { id: `${D}cp_craft`, name: "Craft Collective", url: "craftco.studio", pricing: "$2.5k/project", positioning: "Boutique brand + content", strengths: "Beautiful design", weaknesses: "No performance focus", threat: "medium", notes: "Design-led, not data-led.", createdAt: "2026-02-10T09:00:00.000Z" },
  { id: `${D}cp_botly`, name: "Botly AI", url: "botly.ai", pricing: "$99/mo self-serve", positioning: "DIY automation tool", strengths: "Cheap, fast onboarding", weaknesses: "Generic, no strategy", threat: "low", notes: "Different buyer; not direct.", createdAt: "2026-03-22T09:00:00.000Z" },
];

async function upsert<T extends WithId>(key: string, demos: T[]): Promise<void> {
  const existing = (await kvGet<T[]>(key)) ?? [];
  const demoIds = new Set(demos.map((d) => d.id));
  const kept = existing.filter((e) => !demoIds.has(e.id));
  await kvSet(key, [...kept, ...demos]);
}

async function stripDemo<T extends WithId>(key: string): Promise<void> {
  const existing = (await kvGet<T[]>(key)) ?? [];
  await kvSet(key, existing.filter((e) => !e.id.startsWith(D)));
}

/** The automations that have seedable demo data, each mapped to its kv store. */
export type DemoResource = "clients" | "leads" | "projects" | "competitors";

const REGISTRY: Record<DemoResource, { key: string; rows: WithId[] }> = {
  clients: { key: "crm-clients", rows: DEMO_CLIENTS },
  leads: { key: "sales-leads", rows: DEMO_LEADS },
  projects: { key: "projects", rows: DEMO_PROJECTS },
  competitors: { key: "competitors", rows: DEMO_COMPETITORS },
};

export const DEMO_RESOURCES = Object.keys(REGISTRY) as DemoResource[];

export function isDemoResource(v: unknown): v is DemoResource {
  return typeof v === "string" && (DEMO_RESOURCES as string[]).includes(v);
}

/**
 * Seed demo records. Pass a `resource` to seed only that automation's store;
 * omit it to seed all. Additive + idempotent (re-seeding replaces same ids).
 */
export async function seedDemo(resource?: DemoResource): Promise<void> {
  const targets = resource ? [resource] : DEMO_RESOURCES;
  for (const r of targets) await upsert(REGISTRY[r].key, REGISTRY[r].rows);
}

/** Remove demo records (one resource, or all). Real data is preserved. */
export async function clearDemo(resource?: DemoResource): Promise<void> {
  const targets = resource ? [resource] : DEMO_RESOURCES;
  for (const r of targets) await stripDemo(REGISTRY[r].key);
}
