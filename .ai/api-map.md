# API Map

Route handlers live in `app/api/**/route.ts`. They are **thin** — they delegate to a feature `api/handlers.ts` (pipeline) or a `service.ts` (kv CRUD) or a `shared/services/*` module. URLs are kept stable on purpose.

## Auth (public)
| Method | Path | Handler → | Does |
|--------|------|-----------|------|
| POST | /api/auth/login | login/route.ts → `credentials.verifyLogin` + `signSession(user,role)` | Rate-limited (8 fails/15min/IP → 429). Resolves role owner\|admin. Set `sampeer_session` cookie |
| POST | /api/auth/logout | app/api/auth/logout/route.ts | Clear cookie |

`middleware.ts` gates everything: no session → 401/redirect; **admin** hitting `/settings` or `/api/settings` → 403/redirect (owner-only).

## Trigger pipelines (async; trigger then poll)
| Method | Path | Handler → | Does |
|--------|------|-----------|------|
| POST | /api/invoices | invoice-generator/api/handlers.ts `triggerInvoice` | validate+applySettings → `tasks.trigger('generate-invoice')` → `{runId}` |
| GET | /api/invoices/[runId] | …`getInvoiceRun` | `runs.retrieve` → status+output |
| POST | /api/proposals | proposal-generator/api/handlers.ts | → `generate-proposal` task |
| GET | /api/proposals/[runId] | " | poll |
| POST | /api/expenses | expense-tracker/api/handlers.ts | → `track-expenses` task (CSV) |
| GET | /api/expenses/[runId] | " | poll |

## kv CRUD data-apps
Pattern: `GET` list · `POST` create/update (id present = update) · `DELETE /[id]`.
GET redacts money for admin (`rbac.redactMoneyForAdmin`); POST/DELETE call `audit.logAudit`.
| Resource | Routes | service.ts | kv key | money field redacted |
|----------|--------|-----------|--------|----------------------|
| clients | /api/clients (GET,POST) · /api/clients/[id] (DELETE) | client-crm/service.ts | `crm-clients` | `value` |
| projects | /api/projects (GET,POST) · /[id] (DELETE) | project-dashboard/service.ts | `projects` | `value` |
| leads | /api/leads (GET,POST) · /[id] (DELETE) | lead-pipeline/service.ts | `sales-leads` | `value` |
| competitors | /api/competitors (GET,POST) · /[id] (DELETE) | competitor-radar/service.ts | `competitors` | `pricing` |

## Platform
| Method | Path | → | Does |
|--------|------|---|------|
| GET/PUT | /api/settings | shared/services/settings.ts | Read/save white-label settings (kv + cookie). **Owner-only** (middleware). PUT audited. |
| POST(/GET) | /api/installs | shared/services/installs.ts | Toggle automation install state (kv key `installs`) |
| POST | /api/demo | shared/services/demo-data.ts | `{action:seed\|clear, resource?}` — per-automation demo data (scoped or all). Audited. |

## Conventions
- Bodies validated with **zod**; bad shape → 400/422 with issue list.
- Pipeline POST returns `{ runId }`; GET returns `{ status, isCompleted, isFailed, output, error }`.
- All CRUD/settings routes are `runtime = "nodejs"` (fs-backed kv). Pipeline poll uses Trigger SDK (needs `TRIGGER_SECRET_KEY`).
- Client-only automations (gst, seo, repurpose, trend, video, cold-email, meeting, analytics, website-health) have **no API** — they compute in the browser.
