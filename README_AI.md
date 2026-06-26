# README_AI.md — Sampeer OS (LLM-condensed)

Densest map of the repo. For depth open the linked `.ai/*` file. **Don't read the whole repo.**

## TL;DR
Single-owner automations dashboard. Next.js 15 App Router + React 19 + Trigger.dev workers. 16 automations in 4 OSes, all rendered from `features/registry.ts`. Rule: **TS owns all numbers; LLM writes prose only.**

## Map
- Structure → `.ai/folder-tree.md` · `.ai/architecture.md`
- Features (16) → `.ai/feature-map.md` · `.ai/features.json`
- HTTP → `.ai/routes.md` · `.ai/api-map.md`
- Data → `.ai/database.md` (kv JSON, no SQL)
- Shared infra → `.ai/services.md` · `.ai/components.md` · `.ai/utilities.md`
- Graph → `.ai/knowledge-graph.json` · `.ai/relationships.json` · `.ai/navigation.json` · `.ai/dependencies.json`
- Find symbol → `.ai/search-index.json`
- Env → `.ai/env.md`

## Hierarchy
`registry.ts`: OS → Module → Automation.
- **BusinessOS**: invoice-generator, proposal-generator, expense-tracker, gst-calculator, client-crm, project-dashboard
- **ContentOS**: video-factory, seo-writer, repurpose-engine, trend-hunter
- **SalesOS**: lead-pipeline, cold-email, meeting-summary
- **GrowthOS**: analytics, website-health, competitor-radar (registry slug `competitors`)

## Three patterns
| Pattern | Automations | Flow |
|--------|-------------|------|
| pipeline | invoice, proposal, expense | Form → POST /api/x → Trigger orchestrator: validate+calc(TS) → agent(Gemini prose) → render-pdf → send-email(Resend→Composio) → poll GET /api/x/:runId |
| kv CRUD | client-crm, project-dashboard, lead-pipeline, competitor-radar | View → /api/<resource>(GET/POST,DELETE /:id) → service.ts → kv `.data/<key>.json` → utils/ metric |
| client-only | gst, video, seo, repurpose, trend, cold-email, meeting, analytics, website-health | View → useMemo → utils/<engine>.ts → optional in-browser PDF |

## Layout
`app/` pages + thin api routes · `features/<os>/<slug>/` slices + `registry.ts` · `shared/{services,ui,navigation,charts,lib}` · `test/` · `middleware.ts` (auth gate) · `trigger.config.ts`.

## Invariants
- Numbers never go through the LLM.
- `shared/services/*` server-only; `auth.ts`+`middleware.ts` edge-safe (jose).
- Aliases `@features/*`, `@shared/*`. Stable API URLs.
- Each engine has a `test/`; `npm test` (74) + `npm run build` must pass.

## Add a feature
registry entry → `features/<os>/<slug>/` → `app/(app)/<os>/<slug>/page.tsx` → `test/<slug>.test.ts` → (pipeline) add trigger dir to `trigger.config.ts`.

## Commands
dev: `npm run dev` + `npm run dev:trigger` · build: `npm run build` · test: `npm test` · deploy: Vercel + `npm run deploy:trigger`.

## Stack
next15, react19, typescript5.7(strict), tailwind3, @trigger.dev/sdk, ai+@ai-sdk/google(Gemini), @react-pdf/renderer, resend, @composio/core, jose, zod, framer-motion, lucide-react.
