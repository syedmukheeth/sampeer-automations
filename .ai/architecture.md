# Architecture

## One-paragraph
A single-owner SaaS shell (Next.js 15 App Router) that renders a tree of **16 automations** from one registry. Each automation is a self-contained vertical slice under `features/`. Long-running work (LLM + PDF + email) is pushed to **Trigger.dev** workers; everything else runs in-process (Next API routes) or in the browser. Persistence is a swappable kv adapter (JSON file → Redis). Auth is a stateless owner JWT enforced by middleware.

## Layers
```
            ┌─────────────────────────────────────────────┐
 Browser    │  app/(app)/**/page.tsx  →  features/**/*View │  React 19 client comps
            └───────────────┬─────────────────────────────┘
                            │ fetch
            ┌───────────────▼─────────────────────────────┐
 Next API   │  app/api/**/route.ts (thin)                  │  edge middleware gate
            │     → features/**/api/handlers.ts (pipeline) │
            │     → features/**/service.ts     (kv CRUD)   │
            │     → shared/services/* (auth,settings,runs) │
            └───────┬───────────────────────┬─────────────┘
          tasks.trigger / runs.retrieve     │ kvGet/kvSet
            ┌───────▼──────────┐     ┌───────▼─────────┐
 Workers    │ Trigger.dev      │     │ kv store        │
            │ orchestrator →   │     │ .data/*.json    │
            │ agent(Gemini)→   │     │ (→ Redis later) │
            │ render-pdf →     │     └─────────────────┘
            │ send-email       │
            │ (Resend/Composio)│
            └──────────────────┘
```

## Key decisions
1. **Registry-driven shell** — `features/registry.ts` is the single source of truth (OS→Module→Automation). Sidebar, dashboard, library all derive from it. New automation = feature folder + 1 entry.
2. **Feature-sliced** — each automation owns its components, utils, types, API, trigger tasks, prompts. Cross-cutting code lives in `shared/`. Aliases `@features/*`, `@shared/*`.
3. **Determinism boundary** — TS does all math/validation; LLM writes prose only. Makes output testable & safe (74 unit tests).
4. **Three patterns, one feel** — pipeline / kv-CRUD / client-only. All share `shared/ui` + `AutomationPageLayout` so they look identical.
5. **Stateless workers** — branding/settings travel in the Trigger payload (`applySettings`), so the worker needs no DB/session.
6. **Swappable infra** — kv adapter and run-store hide their backends behind small interfaces; swap to Redis/DB without touching callers.
7. **Marketplace gating** — installs.ts decides what the shell shows; pages also self-gate (`InstallRequired`).
8. **Stable URLs** — app/api routes are thin shims so feature internals can move without breaking the client.

## Boundaries to respect
- `shared/services/*` are **server-only** (fs/secrets). Never import in a client component.
- `auth.ts` stays `jose`-only (edge-safe — middleware imports it). Don't add `fs`/Node-only deps to it.
- Trigger worker dirs are explicit in `trigger.config.ts` (only the 3 pipeline features) — keeps the indexer off `.tsx`.
- Money/scores never go through the LLM.

## Build/test
`npm run build` (Next) · `npm test` (node:test, 74) · `npm run dev` + `npm run dev:trigger` for local. Deploy: Vercel (web) + `npm run deploy:trigger` (worker). See [env.md](env.md).
