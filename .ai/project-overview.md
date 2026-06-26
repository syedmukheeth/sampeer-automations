# Project Overview — Sampeer OS

> Read this first. Then load only the `.ai/*` files you need. Do **not** re-read the whole repo.

## What it is
A single-owner **automations dashboard** ("Sampeer Automations" / "Sampeer OS"): one shell that hosts **16 live automations** grouped into **4 operating systems**. Next.js 15 (App Router) frontend + API routes, with heavy work offloaded to **Trigger.dev** background workers.

## Hierarchy (single source of truth)
`features/registry.ts` defines: **Operating System → Module → Automation**. The sidebar, dashboard KPIs and Library all render from it. Ship a new automation = build its feature folder + add one registry entry. Nothing else changes.

| OS | id | Modules → automations |
|----|----|----|
| BusinessOS | `business-os` | finance: invoice-generator, proposal-generator, expense-tracker, gst-calculator · clients: client-crm, project-dashboard |
| ContentOS | `content-os` | create: video-factory, seo-writer, repurpose-engine · research: trend-hunter |
| SalesOS | `sales-os` | pipeline: lead-pipeline, cold-email, meeting-summary |
| GrowthOS | `growth-os` | insight: analytics, website-health, competitor-radar (slug `competitors`) |

## Three automation patterns (every feature is one of these)
1. **Trigger pipeline** (`invoice-generator`, `proposal-generator`, `expense-tracker`) — form → `POST /api/x` → `tasks.trigger` → orchestrator task → `validate()`+`calc()` (TS) → agent (Gemini, prose only) → `render-pdf` → `send-email` (Resend→Composio Gmail). Client polls `GET /api/x/[runId]`.
2. **kv CRUD data-app** (`client-crm`, `project-dashboard`, `lead-pipeline`, `competitor-radar`) — `service.ts` ↔ `kvGet/kvSet` (JSON file in `.data/`) ↔ `/api/<resource>` routes. Scoring/health computed in `utils/`.
3. **Client-only TS** (`gst-calculator`, `video-factory`, `seo-writer`, `repurpose-engine`, `trend-hunter`, `cold-email`, `meeting-summary`, `analytics`, `website-health`) — pure deterministic engine in `utils/`, recomputed in the View via `useMemo`. No API, no worker.

## Iron rule (applies everywhere)
**All math, validation, aggregation, scoring → TypeScript. The LLM only writes prose / assigns labels.** The model never sees or emits numbers (prices, taxes, totals, scores).

## Stack
Next.js 15 · React 19 · TypeScript 5.7 (strict) · Tailwind 3 · Trigger.dev 4.4 · `ai` SDK + `@ai-sdk/google` (Gemini) · `@react-pdf/renderer` · Resend + `@composio/core` (Gmail) · `jose` (JWT auth) · `zod` · framer-motion · lucide-react.

## Auth
Single owner. `middleware.ts` gates everything except `/login` and `/api/auth/*` behind a `jose`-signed httpOnly session cookie (`sampeer_session`, 30d). See [services.md](services.md) → auth.

## Path aliases
`@features/*` → `features/*` · `@shared/*` → `shared/*`.

## Where to look next
- Layout of the repo → [folder-tree.md](folder-tree.md)
- Per-feature ownership → [feature-map.md](feature-map.md) · [features.json](features.json)
- Data/persistence → [database.md](database.md)
- HTTP surface → [routes.md](routes.md) · [api-map.md](api-map.md)
- Shared infra → [services.md](services.md) · [components.md](components.md) · [utilities.md](utilities.md)
- Graph/relationships → [knowledge-graph.json](knowledge-graph.json) · [relationships.json](relationships.json) · [navigation.json](navigation.json) · [dependencies.json](dependencies.json)
- Find anything → [search-index.json](search-index.json)
