# Services (`shared/services/*`)

Server-only platform layer. Never import these from a client component (they touch fs / `TRIGGER_SECRET_KEY` / env secrets).

| File | Exports | Role |
|------|---------|------|
| `auth.ts` | `SESSION_COOKIE`, `Role`, `signSession(username,role)`, `verifyToken`, `getSessionClaims`, `hasValidSession`, `hasOwnerSession`, `AuthClaims` | **Two-role** JWT auth via `jose`. **Edge-safe** (middleware imports it). JWT carries `{username, role, kind}`; role = `owner`\|`admin`; HS256, 30d, `AUTH_SECRET`. `hasOwnerSession` = role owner; `hasValidSession` = owner OR admin. Credential checking lives in `credentials.ts` (node crypto, kept out of edge). |
| `credentials.ts` | `verifyLogin(username,password) → Role\|null` | **Server-only** (node `crypto`). Constant-time compare; optional scrypt hashing via `AUTH_PASSWORD_HASH`/`ADMIN_PASSWORD_HASH` (format `scrypt$salt$hash`, gen `node scripts/hash-password.mjs`). Owner checked before admin. |
| `session.ts` | `currentSession() → {username,role}\|null` | **Server-only**. Reads + verifies the cookie inside server components/routes via `next/headers`. |
| `rbac.ts` | `isAdminRequest()`, `redactMoneyForAdmin(rows, keys)` | **Server-only**. GET routes call it to zero money fields (`value`) / mask strings (`pricing`) for the admin role — so raw JSON never leaks money. |
| `audit.ts` | `logAudit(action,resource,id?)`, `readAudit(limit)`, `AuditEntry` | **Server-only**. Append-only trail (who+role+action) in kv key `audit-log`, capped 500. Wired into all CRUD POST/DELETE + settings PUT + /api/demo. Surfaced on Settings → "Recent changes". Never throws into the request path. |
| `demo-data.ts` | `seedDemo(resource?)`, `clearDemo(resource?)`, `DEMO_RESOURCES`, `isDemoResource`, `DemoResource` | **Server-only**. Per-automation demo records (ids prefixed `demo_`, additive/reversible). Resources: clients→`crm-clients`, leads→`sales-leads`, projects→`projects`, competitors→`competitors`. |
| `store.ts` | `kvGet`, `kvSet` | Swappable kv adapter (JSON file in `.data/`). See [database.md](database.md). |
| `runs.ts` | `RunRecord`, `RunMetrics`, `listRuns`, `getRunMetrics`, `runTimeAgo`, `formatDuration` | Reads Trigger.dev run history → dashboard metrics (success rate, avg runtime, cost, 14-day buckets). Returns `[]` on any error so UI never crashes. |
| `installs.ts` | `InstallState`, `getInstalls`, `installedSlugs`, `isInstalled`, `setInstalled` | Marketplace toggle. Live automations default installed; overrides in kv key `installs`. Shell only surfaces installed; pages gate on it. Imports `@features/registry`. |
| `settings.ts` | `getSettings`, `saveSettings`, `encodeSettingsCookie`, `SETTINGS_COOKIE` + re-exports schema | White-label branding + invoice defaults. Defaults seeded from env. Merged over defaults (forward-compatible). Injected into Trigger payloads so the worker stays stateless. |
| `settings-schema.ts` | `settingsSchema`, `Settings` | Zod schema for the above. |

## Auth flow (two roles: owner = founder, admin = limited)
```
POST /api/auth/login → rate-limit(IP) → verifyLogin(env creds) → role → signSession(user,role) → Set-Cookie sampeer_session
every request → middleware.ts → getSessionClaims(cookie):
    no session  → 401(api) | redirect /login(page)
    admin + /settings|/api/settings → 403 | redirect /
    else → next()
```
Roles: owner = full. admin = can sign in + edit, but money is redacted server-side (`rbac.ts`) and Settings/secrets are blocked (middleware). Client-side masking via `useIsAdmin`/`Money`.

## Key dependencies between services
- `installs.ts` → `store.ts` + `registry.ts`
- `settings.ts` → `store.ts` + `settings-schema.ts` + `next/headers` cookies
- `runs.ts` → `@trigger.dev/sdk` (`runs.list/retrieve`)
- `auth.ts` → `jose` only (no fs/node-crypto — edge-safe). `credentials.ts`/`session.ts`/`rbac.ts`/`audit.ts`/`demo-data.ts` are **server-only** (node) — never import in middleware/client.

See [knowledge-graph.json](knowledge-graph.json) for node-level edges.
