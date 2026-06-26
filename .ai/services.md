# Services (`shared/services/*`)

Server-only platform layer. Never import these from a client component (they touch fs / `TRIGGER_SECRET_KEY` / env secrets).

| File | Exports | Role |
|------|---------|------|
| `auth.ts` | `SESSION_COOKIE`, `signSession`, `verifyToken`, `isOwnerLogin`, `isOwnerUsername`, `hasOwnerSession`, `AuthClaims` | Single-owner JWT auth via `jose`. **Edge-safe** (middleware imports it). Session token = HS256 JWT, kind `session`, 30d, signed with `AUTH_SECRET`. |
| `store.ts` | `kvGet`, `kvSet` | Swappable kv adapter (JSON file in `.data/`). See [database.md](database.md). |
| `runs.ts` | `RunRecord`, `RunMetrics`, `listRuns`, `getRunMetrics`, `runTimeAgo`, `formatDuration` | Reads Trigger.dev run history → dashboard metrics (success rate, avg runtime, cost, 14-day buckets). Returns `[]` on any error so UI never crashes. |
| `installs.ts` | `InstallState`, `getInstalls`, `installedSlugs`, `isInstalled`, `setInstalled` | Marketplace toggle. Live automations default installed; overrides in kv key `installs`. Shell only surfaces installed; pages gate on it. Imports `@features/registry`. |
| `settings.ts` | `getSettings`, `saveSettings`, `encodeSettingsCookie`, `SETTINGS_COOKIE` + re-exports schema | White-label branding + invoice defaults. Defaults seeded from env. Merged over defaults (forward-compatible). Injected into Trigger payloads so the worker stays stateless. |
| `settings-schema.ts` | `settingsSchema`, `Settings` | Zod schema for the above. |

## Auth flow
```
POST /api/auth/login → isOwnerLogin(env creds) → signSession() → Set-Cookie sampeer_session
every request → middleware.ts → hasOwnerSession(cookie) → next() | 401(api) | redirect /login(page)
```

## Key dependencies between services
- `installs.ts` → `store.ts` + `registry.ts`
- `settings.ts` → `store.ts` + `settings-schema.ts` + `next/headers` cookies
- `runs.ts` → `@trigger.dev/sdk` (`runs.list/retrieve`)
- `auth.ts` → `jose` only (no fs — that's why it's edge-safe)

See [knowledge-graph.json](knowledge-graph.json) for node-level edges.
