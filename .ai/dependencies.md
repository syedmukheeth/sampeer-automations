# Dependencies

Human view; machine view in [dependencies.json](dependencies.json).

## Runtime (package.json)
| Package | Used for | Where |
|---------|----------|-------|
| `next` 15 / `react` 19 / `react-dom` | App Router app | app/, shared/, features/**/components |
| `@trigger.dev/sdk` 4.4 | background tasks + run history | features/**/trigger, shared/services/runs.ts, api/handlers.ts |
| `@trigger.dev/react-hooks` | (available) live run subscription | client (currently poll instead) |
| `ai` 6 + `@ai-sdk/google` | Gemini prose agents | features/**/trigger/*-agent.ts |
| `@react-pdf/renderer` | branded PDFs | features/**/utils/*-pdf.tsx |
| `resend` | primary email | features/**/trigger/send-*email.ts |
| `@composio/core` | Gmail fallback email | send-*email.ts (see memory composio-sdk-gotchas) |
| `jose` | JWT owner auth (edge-safe) | shared/services/auth.ts, middleware.ts |
| `zod` 3 | schemas/validation | features/**/utils/schema.ts, settings-schema.ts |
| `framer-motion` | animations/page transitions | shared/lib/motion.ts, shared/ui/PageTransition |
| `lucide-react` | icons | registry.ts, ui, nav |
| `clsx` + `tailwind-merge` | classnames | shared/lib/cn.ts |

## Dev
`typescript` 5.7 · `tsx` (test runner import) · `tailwindcss` 3 + `postcss` + `autoprefixer` · `@trigger.dev/build` · `@types/*`.

## Internal dependency rules
- `features/**` may import `@shared/*` and `@features/registry`. Avoid feature→feature imports (keep slices independent).
- `shared/services/*` import `store`, `registry`, Trigger SDK, env — **server-only**.
- `middleware.ts` may only import edge-safe modules (`auth.ts` ok; `store.ts`/`settings.ts` not — they use `fs`/`next/headers`).
- Client components must not import `shared/services/*`.

## Notable graph facts
- `registry.ts` is imported by: Sidebar, dashboard page, library page, installs.ts, getAutomation callers. **High fan-in — change carefully.**
- `store.ts` fan-in: installs.ts, settings.ts, all 4 kv `service.ts`.
- No circular dependencies expected; no known dead files. `@trigger.dev/react-hooks` is the main currently-unused-in-Views dependency (kept for the live-subscription upgrade path).
