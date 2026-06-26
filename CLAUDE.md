# CLAUDE.md — Sampeer OS

> **AI assistants: start at [.ai/project-overview.md](.ai/project-overview.md), then load only the `.ai/*` file you need. Do not read the whole repo.** The `.ai/` folder is a maintained knowledge graph of this codebase.

## Purpose
Single-owner **automations dashboard**: one Next.js shell hosting **16 live automations** across **4 operating systems** (BusinessOS, ContentOS, SalesOS, GrowthOS). Heavy work (LLM + PDF + email) runs on Trigger.dev workers.

## Architecture (3-min version)
- **Registry-driven**: [features/registry.ts](features/registry.ts) is the single source of truth (OS→Module→Automation). Sidebar, dashboard, library all derive from it.
- **Feature-sliced**: each automation is a self-contained folder `features/<os-id>/<slug>/`. Cross-cutting code in `shared/`.
- **Three patterns** (full detail: [.ai/architecture.md](.ai/architecture.md), [.ai/business-logic.md](.ai/business-logic.md)):
  1. **pipeline** (invoice/proposal/expense) — `POST /api/x` → Trigger orchestrator → validate+calc (TS) → agent (Gemini, prose) → render-pdf → send-email → poll `GET /api/x/:runId`.
  2. **kv CRUD** (client-crm/project-dashboard/lead-pipeline/competitor-radar) — `service.ts` ↔ kv store ↔ `/api/<resource>`.
  3. **client-only** (gst, seo, repurpose, trend, video, cold-email, meeting, analytics, website-health) — pure `utils/` engine recomputed in the View via `useMemo`.

## The rule you must not break
**All math, validation, scoring → deterministic TypeScript. The LLM only writes prose / labels.** The model never sees or emits numbers (prices, taxes, totals, scores).

## Folder structure
`app/` Next pages + thin API routes · `features/` automations + `registry.ts` · `shared/` services/ui/nav/charts/lib · `test/` unit tests · `middleware.ts` auth gate · `trigger.config.ts` worker dirs. Tree: [.ai/folder-tree.md](.ai/folder-tree.md).

## Conventions
- Aliases: `@features/*`, `@shared/*`. TS strict.
- Page (`app/(app)/…/page.tsx`) = thin server component rendering the feature's `*View`. Interactivity lives in the View.
- Import UI from `@shared/ui` (barrel). Use `AutomationPageLayout` for automation page chrome.
- `shared/services/*` are **server-only** (fs/secrets) — never import in a client component.
- `middleware.ts` / `auth.ts` must stay **edge-safe** (jose only; no fs).
- Every deterministic engine has a `test/<slug>.test.ts`. Run `npm test` after logic changes.
- Naming: feature component = `<Name>View.tsx` (+ `<Name>Form.tsx` for pipeline). kv key per service.ts.

## How to add a feature
1. Add one entry to [features/registry.ts](features/registry.ts) under the right OS→module.
2. Build `features/<os>/<slug>/` (components + utils; +api/trigger/prompts if pipeline; +service.ts if kv).
3. Add `app/(app)/<os>/<slug>/page.tsx` rendering the `*View`.
4. Add `test/<slug>.test.ts`.
5. Pipeline only: add `./features/<os>/<slug>/trigger` to `trigger.config.ts`.
Walk-through: [.ai/navigation.json](.ai/navigation.json) → "Add a new automation".

## Important files / entry points
- Source of truth: `features/registry.ts`
- Auth: `shared/services/auth.ts` + `middleware.ts`
- Persistence: `shared/services/store.ts` (kv) — see [.ai/database.md](.ai/database.md)
- Pipeline reference: `features/business-os/invoice-generator/` (others mirror it)
- Env: [.ai/env.md](.ai/env.md)

## Common workflows
- Run: `npm run dev` + `npm run dev:trigger`. Build: `npm run build`. Test: `npm test`.
- Deploy: Vercel (web) + `npm run deploy:trigger` (worker).

## Known notes / TODOs
- `@trigger.dev/react-hooks` is a dependency but Views currently poll REST; kept for a live-subscription upgrade.
- Client-only & kv engines are designed as swap-points to upgrade to LLM/live-data (HANDOFF.md §7; [.ai/feature-map.md](.ai/feature-map.md)).
- kv store is single-workspace JSON files; key by tenant id + swap to Redis for multi-tenant.
- `README.md` is invoice-centric (pre-platform). `HANDOFF.md` is the richest human doc.

## Don't
Don't change app logic to "improve" it unasked. Don't route numbers through the LLM. Don't import server services into client components. Don't add Node-only deps to `auth.ts`/`middleware.ts`. Don't rename routes (clients depend on stable URLs).
