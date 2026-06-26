# AGENTS.md — Sampeer OS

Guidance for any AI coding agent (Claude Code, Codex, Gemini CLI, Cursor, Windsurf). Mirror of [CLAUDE.md](CLAUDE.md); see [.ai/](.ai/) for the full knowledge graph.

## Repository summary
Single-owner automations dashboard. Next.js 15 (App Router) + React 19 + Trigger.dev 4.4 workers. **16 automations** in **4 OSes**, all rendered from one registry. TypeScript strict; Tailwind 3.

## How to navigate (token-cheap)
1. Read [.ai/project-overview.md](.ai/project-overview.md).
2. Need a feature? → [.ai/feature-map.md](.ai/feature-map.md) / [.ai/features.json](.ai/features.json).
3. Need a symbol/file? → [.ai/search-index.json](.ai/search-index.json).
4. Need a flow? → [.ai/navigation.json](.ai/navigation.json).
5. Need edges/deps? → [.ai/knowledge-graph.json](.ai/knowledge-graph.json), [.ai/relationships.json](.ai/relationships.json), [.ai/dependencies.json](.ai/dependencies.json).
Avoid full-repo reads — the graph already encodes structure.

## Business rules (do not violate)
- **Determinism boundary**: all math/validation/scoring in TypeScript; the LLM writes prose/labels only. Numbers (prices, taxes, totals, scores) never pass through the model.
- **Stable URLs**: `app/api/*` routes are thin shims; keep paths stable so the client keeps working.
- **Marketplace gating**: only installed automations surface in the shell; pages also self-gate.
- **Single owner**: every route except `/login` & `/api/auth/*` requires the owner session.

## Coding standards
- Aliases `@features/*`, `@shared/*`. No deep relative `../../../`.
- Pages are thin server components; logic lives in the feature `*View` + `utils/`.
- Reuse `@shared/ui` and `AutomationPageLayout` before writing new UI.
- Validate inputs with zod (`utils/schema.ts` / `settings-schema.ts`).
- Add/keep a `test/<slug>.test.ts` for any deterministic engine; `npm test` must pass (74 tests).
- Match surrounding comment density and naming.

## Architecture decisions
See [.ai/architecture.md](.ai/architecture.md). Key: registry-driven shell, feature slices, three patterns (pipeline/kv/client-only), stateless Trigger workers (branding travels in payload), swappable kv + run-store.

## Dependency rules
- `shared/services/*` = server-only (fs/secrets/Trigger key). Never import in client components.
- `middleware.ts` & `auth.ts` = edge-safe (jose only). No `fs`, no `next/headers`.
- Features may import `@shared/*` and `@features/registry`; **avoid feature→feature imports**.
- Trigger worker dirs are explicit in `trigger.config.ts` (3 pipeline features only).

## Feature ownership / where logic lives
| Concern | Location |
|--------|----------|
| Platform hierarchy/KPIs | `features/registry.ts` |
| Auth | `shared/services/auth.ts`, `middleware.ts`, `app/api/auth/*` |
| Persistence (kv) | `shared/services/store.ts` + each `service.ts` |
| Run metrics | `shared/services/runs.ts` |
| White-label settings | `shared/services/settings.ts` |
| Per-automation logic | `features/<os>/<slug>/utils/` (engine) + `components/<Name>View.tsx` |
| Pipeline orchestration | `features/<os>/<slug>/trigger/` + `api/handlers.ts` |
| LLM prompts | `features/<os>/<slug>/prompts/` |
Full table: [.ai/feature-map.md](.ai/feature-map.md).

## How to add a feature
registry entry → feature folder → page → test → (pipeline) trigger.config dir. See [.ai/navigation.json](.ai/navigation.json).

## Validate before done
`npm test` (logic) and `npm run build` (types/Next). Don't modify app behavior unless asked; this repo's invariant is determinism + stable URLs.
