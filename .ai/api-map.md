# API Map

Route handlers live in `app/api/**/route.ts`. They are **thin** — they delegate to a feature `api/handlers.ts` (pipeline) or a `service.ts` (kv CRUD) or a `shared/services/*` module. URLs are kept stable on purpose.

## Auth (public)
| Method | Path | Handler → | Does |
|--------|------|-----------|------|
| POST | /api/auth/login | app/api/auth/login/route.ts → auth.isOwnerLogin + signSession | Set `sampeer_session` cookie |
| POST | /api/auth/logout | app/api/auth/logout/route.ts | Clear cookie |

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
| Resource | Routes | service.ts | kv key |
|----------|--------|-----------|--------|
| clients | /api/clients (GET,POST) · /api/clients/[id] (DELETE) | client-crm/service.ts | `crm-clients` |
| projects | /api/projects (GET,POST) · /[id] (DELETE) | project-dashboard/service.ts | `projects` |
| leads | /api/leads (GET,POST) · /[id] (DELETE) | lead-pipeline/service.ts | `leads` |
| competitors | /api/competitors (GET,POST) · /[id] (DELETE) | competitor-radar/service.ts | `competitors` |

## Platform
| Method | Path | → | Does |
|--------|------|---|------|
| GET/POST | /api/settings | shared/services/settings.ts | Read/save white-label settings (kv + cookie) |
| POST(/GET) | /api/installs | shared/services/installs.ts | Toggle automation install state (kv key `installs`) |

## Conventions
- Bodies validated with **zod**; bad shape → 400/422 with issue list.
- Pipeline POST returns `{ runId }`; GET returns `{ status, isCompleted, isFailed, output, error }`.
- All CRUD/settings routes are `runtime = "nodejs"` (fs-backed kv). Pipeline poll uses Trigger SDK (needs `TRIGGER_SECRET_KEY`).
- Client-only automations (gst, seo, repurpose, trend, video, cold-email, meeting, analytics, website-health) have **no API** — they compute in the browser.
