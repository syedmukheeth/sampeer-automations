# Database / Persistence

**No SQL database.** Persistence is a swappable key-value adapter.

## kv store
`shared/services/store.ts` — `kvGet<T>(key)` / `kvSet<T>(key,value)`.
- Default adapter: one JSON file per key under `.data/<key>.json` (gitignored).
- Read-only / serverless FS → writes fail **safely** (return `false`), reads fall back to defaults. UI never crashes.
- To scale: replace the two functions with Vercel KV / Upstash Redis. **Nothing else in the app changes.** Single-workspace today; key by tenant id to go multi-tenant.

## Keys (logical "tables")
| Key | Owner | Shape | Source |
|-----|-------|-------|--------|
| `crm-clients` | client-crm/service.ts | `Client[]` | utils/schema.ts |
| `projects` | project-dashboard/service.ts | `Project[]` | utils/schema.ts |
| `leads` | lead-pipeline/service.ts | `Lead[]` | utils/schema.ts |
| `competitors` | competitor-radar/service.ts | `Competitor[]` | utils/schema.ts |
| `settings` | shared/services/settings.ts | `Settings` (branding+invoice) | settings-schema.ts |
| `installs` | shared/services/installs.ts | `Record<slug,boolean>` | — |

CRUD services parse every record through its zod schema on read, so partial/older records get defaults filled. IDs generated client-side (`cl_<base36>` style, `Date.now`+random).

## Run history (read-only "table")
`shared/services/runs.ts` reads **Trigger.dev's own run history** (every task run is already persisted there) → dashboard metrics with zero extra infra. Tags carry context (`client:…`, `invoice:…`). Swap internals for a DB later without touching callers.

## Auth & settings storage
- Session: stateless **JWT cookie** (`jose`), no DB. See [services.md](services.md) → auth.
- Settings also mirrored into a `sampeer_settings` cookie (read in settings.ts) so server components see them without a kv round-trip.

Schemas (the closest thing to a data model) are listed in [utilities.md](utilities.md) and indexed in [search-index.json](search-index.json).
