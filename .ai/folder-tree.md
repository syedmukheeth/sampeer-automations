# Folder Tree

Annotated. Omits `node_modules`, `.next`, `.git`, `.data`, build artifacts.

```
e:\Automations
├─ app/                         Next.js App Router (UI pages + API routes)
│  ├─ layout.tsx                Root HTML shell + fonts + globals.css
│  ├─ globals.css               Tailwind base + design tokens
│  ├─ login/page.tsx            Public login page (outside (app) gate)
│  ├─ (app)/                    Authed shell group (Sidebar+Topbar+PageTransition)
│  │  ├─ layout.tsx             Loads installedSlugs(), renders nav
│  │  ├─ page.tsx               Dashboard home (KPIs from registry + runs)
│  │  ├─ library/page.tsx       Automation marketplace (install toggles)
│  │  ├─ settings/              White-label settings (page + SettingsForm)
│  │  ├─ business-os/<slug>/page.tsx   6 BusinessOS automation pages
│  │  ├─ content-os/<slug>/page.tsx    4 ContentOS pages
│  │  ├─ sales-os/<slug>/page.tsx      3 SalesOS pages
│  │  └─ growth-os/<slug>/page.tsx     3 GrowthOS pages
│  └─ api/                      Thin route handlers → delegate to features/shared
│     ├─ auth/{login,logout}/route.ts
│     ├─ invoices|proposals|expenses/route.ts + [runId]/route.ts   (Trigger poll)
│     ├─ clients|projects|leads|competitors/route.ts + [id]/route.ts (kv CRUD)
│     ├─ settings/route.ts      GET/POST white-label settings
│     └─ installs/route.ts      Toggle automation install state
│
├─ features/                    Feature-sliced; one folder per automation
│  ├─ registry.ts               ★ SINGLE SOURCE OF TRUTH (OS→Module→Automation)
│  └─ <os-id>/<slug>/           Self-contained vertical slice. Sub-parts (vary by kind):
│       ├─ components/          *View.tsx (orchestrates) + Form/widgets
│       ├─ utils/               schema.ts (zod) · calc/score/audit (deterministic) · *-pdf.tsx
│       ├─ types/index.ts       shared TS types (pipeline features)
│       ├─ api/handlers.ts      feature request handling (pipeline features)
│       ├─ trigger/*.ts         Trigger.dev tasks (pipeline features only)
│       ├─ prompts/*.ts         LLM prompt builders (pipeline features only)
│       └─ service.ts           kv data layer (CRUD features only)
│
├─ shared/                      Cross-feature platform layer
│  ├─ services/                 auth · store(kv) · runs · installs · settings(+schema)
│  ├─ ui/                       Design-system components (+ index.ts barrel)
│  ├─ navigation/               Sidebar · Topbar
│  ├─ charts/                   LineChart · Sparkline
│  └─ lib/                      cn · format · motion
│
├─ test/                        node:test unit tests for every deterministic util
├─ middleware.ts                Owner-session gate (edge)
├─ trigger.config.ts            Trigger.dev project + worker dirs (3 pipeline features)
├─ next.config.mjs · tailwind.config.ts · tsconfig.json · postcss.config.mjs
├─ README.md                    Human setup (invoice-centric, pre-platform)
├─ HANDOFF.md                   Continuation guide — richest human doc
└─ .ai/                         ← THIS knowledge graph (you are here)
```

Feature folder shape depends on its pattern (see [project-overview.md](project-overview.md)):
- **Trigger pipeline**: components + utils + types + api + trigger + prompts
- **kv CRUD**: components + utils + service.ts
- **client-only**: components + utils only
