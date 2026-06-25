# Sampeer Automations - Handoff / Continuation Guide

Status snapshot for picking up this project (e.g. with Codex). Everything below
is **working and verified** unless marked PENDING.

---

## 1. What this is

A single-owner **automations dashboard** (`Sampeer Automations`) built on
**Next.js (frontend + API routes)** + **Trigger.dev (background worker)**.
First automation: an **AI Invoice Generator**.

Pipeline:
```
Next.js form (/invoice) -> POST /api/invoices -> Trigger.dev "generate-invoice":
  1. validate()        deterministic TypeScript (src/lib/validate.ts)
  2. computeTotals()   deterministic TypeScript (src/lib/calc.ts)  ← LLM never does math
  3. invoice-agent     Google Gemini, prose only (descriptions, notes, email copy)
  4. render-pdf        React-PDF -> base64 (src/lib/invoice-pdf.tsx)
  5. send-invoice-email Resend (if configured) else Composio Gmail, PDF attached
Frontend polls GET /api/invoices/:runId until COMPLETED -> shows package + PDF download.
```

**Core rule:** all money math + validation in TypeScript. Gemini only writes
prose. Totals can never be hallucinated.

---

## 2. Auth (single-owner username/password) - DONE

- Stateless: `jose` JWT + httpOnly cookie, **no database**.
- `middleware.ts` gates **every** route except `/login` and `/api/auth/*`
  (pages -> redirect `/login`; api -> 401).
- Only the configured `AUTH_USERNAME` + `AUTH_PASSWORD` can sign in.
- Successful login sets a 30-day session cookie.
- Files: `src/lib/auth.ts`, `middleware.ts`, `app/login/page.tsx`,
  `app/api/auth/{login,logout}/route.ts`.
- Sign out: link in dashboard header -> `/api/auth/logout`.

Verified: valid credentials set a session cookie; protected routes require that
cookie and return 401 without it.

---

## 3. File map (Sampeer OS platform architecture)

Layered platform: **OS -> module -> automation**. One Next.js app, feature
folders + path aliases (`@features/*`, `@shared/*`). Add a new automation by
creating its feature folder + one entry in `features/registry.ts` (+ its
trigger dir in `trigger.config.ts`). Nothing else changes.

```
trigger.config.ts            project "proj_riwwwudaoobdfynosfrd", machine small-2x
                             dirs = each automation's trigger folder (currently invoice-generator)
middleware.ts                auth gate (Edge) - imports @shared/services/auth

features/
  registry.ts                PLATFORM REGISTRY: OS->module->automation tree + selectors
                             (drives sidebar, dashboard KPIs, library)
  business-os/invoice-generator/
    utils/  schema.ts        zod input/output + InvoicePackage type
            calc.ts          totals math (+ round2, formatMoney) - money math in TS
            validate.ts      required-field checks
            invoice-pdf.tsx  branded React-PDF document
    prompts/invoice-agent.ts versioned system prompt (INVOICE_AGENT_PROMPT_VERSION)
    trigger/ generate-invoice.ts  orchestrator (schemaTask) + buildEmailBody()
             invoice-agent.ts     Gemini prose agent google("gemini-2.5-flash")
             render-pdf.ts        PDF -> base64
             send-email.ts        Resend OR Composio Gmail (auto-switch)
    api/handlers.ts          triggerInvoice() POST + getInvoiceRun() poll
    components/ InvoiceForm.tsx           the form (client) + polling
                InvoiceAutomationView.tsx tabbed page (Overview/Run/Config/History/Logs/Docs)
    types/index.ts           public feature types

shared/
  services/auth.ts           jose sign/verify, isOwner, hasOwnerSession
  services/runs.ts           RUN STORE (Phase 2): listRuns()/getRunMetrics() over
                             Trigger.dev runs.list - real execution history + KPIs,
                             no extra DB. Server-only. Swap internals for Postgres
                             later behind the same interface if retention needed.
  services/store.ts          (Phase 3) kv adapter - JSON file under .data/ (gitignored).
                             Swap for Vercel KV/Upstash in prod (multi-instance).
  services/settings.ts       (Phase 3) get/save white-label settings (server, fs).
  services/installs.ts       (Phase 5) MARKETPLACE install store over kv -
                             getInstalls()/installedSlugs()/isInstalled()/setInstalled().
                             Live automations default installed. Sidebar+dashboard
                             show only installed; library has Install/Uninstall toggle;
                             automation pages gate via InstallRequired. Single-workspace
                             now; key by tenantId to go multi-tenant (orgs/billing still
                             need DB+auth+Stripe - out of scope). API: /api/installs GET/PUT.
  services/settings-schema.ts  client-safe zod schema/types/PROMPT_VERSIONS.
                             Settings flow: Settings UI -> PUT /api/settings -> store.
                             api/handlers injects branding+promptVersion into the
                             invoice payload (worker stays stateless); PDF accent/
                             footer/logo + email signature + agent prompt version
                             all read from it. Prompts: prompts/invoice-agent.ts v1/v2.
  ui/                        StatCard, AutomationCard, AutomationPageLayout, StatusBadge,
                             PageHeader, SectionHeader, EmptyState, ActivityCard, LogViewer,
                             ChartCard, Card, Button (+ index.ts barrel)
  charts/                    LineChart, Sparkline (inline SVG - no chart dep)
  navigation/                Sidebar.tsx, Topbar.tsx
  lib/                       cn.ts (clsx+tailwind-merge), format.ts

app/
  (app)/layout.tsx                       shell = Sidebar + Topbar
  (app)/page.tsx                         OVERVIEW dashboard (KPIs, revenue chart, activity)
  (app)/library/page.tsx                 Automation Library (marketplace, grouped by OS)
  (app)/settings/page.tsx                Settings shell (Profile/API Keys/Billing/Logs)
  (app)/business-os/invoice-generator/page.tsx  renders InvoiceAutomationView
  login/page.tsx                         username/password sign-in (outside shell)
  api/invoices/route.ts                  POST -> delegates to feature handler
  api/invoices/[runId]/route.ts          GET -> delegates to feature handler
  api/auth/{login,logout}/route.ts

test/calc.test.ts            totals unit tests (npm run test:calc - 5 pass)
```

> New runtime deps from the migration: `framer-motion`, `lucide-react`,
> `clsx`, `tailwind-merge`. Import convention: Next-side files use
> extensionless imports; trigger worker files keep `.js` on relative imports
> (esbuild). Prompts are `.ts` (not `.md`) so both bundlers resolve them.

> **Phase 4 - 2nd automation (Proposal Generator).** `features/business-os/
> proposal-generator/` mirrors invoice 1:1 (utils/trigger/api/components/
> prompts/types). Registry entry flipped to live; routes `/business-os/
> proposal-generator` + `/api/proposals[/[runId]]`; task ids `generate-proposal`,
> `proposal-agent`, `render-proposal-pdf`, `send-proposal-email`. Its trigger dir
> is added to `trigger.config.ts dirs`.
>
> ⚠️ **Trigger filename rule (learned the hard way):** Trigger.dev bundles ALL
> `dirs` into ONE tmp folder, so trigger FILENAMES must be globally unique across
> automations (task ids being unique is not enough). Invoice uses `render-pdf.ts`
> / `send-email.ts`; proposal uses `render-proposal-pdf.ts` /
> `send-proposal-email.ts`. New automations: prefix trigger files with the
> automation name.

---

## 4. Env vars (.env)

```
TRIGGER_SECRET_KEY=                 # set, working
GOOGLE_GENERATIVE_AI_API_KEY=       # set, working (Gemini)
COMPOSIO_API_KEY=                   # set, FULL-SCOPE key (ak_US...) - execute works
COMPOSIO_USER_ID=sampeer-studio     # Gmail connected ACTIVE under this entity
GMAIL_FROM=smpeer05@gmail.com       # the connected Gmail (sender)
RESEND_API_KEY=                     # EMPTY - set to switch sender to Resend (PENDING)
RESEND_FROM=Sampeer Studio <finance@sampeerstudio.com>
AUTH_SECRET=                        # set (random 48-byte)
AUTH_USERNAME=                      # set, owner login username
AUTH_PASSWORD=                      # set, owner login password
```

Trigger.dev worker reads `.env` locally. For deploy, set the same vars in the
Trigger.dev dashboard (except TRIGGER_SECRET_KEY which is per-env).

---

## 5. Run locally

```bash
npm install
CI=false npx trigger.dev@4.4.6 dev      # worker - pin 4.4.6, CI=false avoids CI-abort
npx next dev                            # web - picks 3000/3001/3002 if busy
npm run test:calc                       # totals tests
npx tsc --noEmit                        # full typecheck (currently 0 errors)
```

Then open the printed `localhost:PORT` and sign in with the configured username/password.

> NOTE: dev sometimes drifts ports (3000->3001->3002) because old `next dev`
> processes hold the port. Kill stragglers or just use the printed port.

---

## 6. Known gotchas (cost real time - see memory `composio-sdk-gotchas`)

- npm `composio` is a STUB. Real SDK = **`@composio/core`**.
- Composio `tools.execute` needs **`dangerouslySkipVersionCheck: true`** (`"latest"` is rejected).
- Composio Gmail **attachment** must be a staged `{name,mimetype,s3key}` descriptor:
  we use `composio.files.upload(...)` then override `.name`/`.mimetype` for a clean
  `Invoice-....pdf`. Needs a **full-scope** API key (scoped/read-only keys 401 on execute+upload).
- Pin all `@trigger.dev/*` to the CLI version (**4.4.6**) or dev aborts on mismatch.
- Test runner: `node --import tsx` (not `--loader`).

---

## 7. PENDING / next steps

1. **Email deliverability (spam fix).** Gmail-personal sends land in spam.
   Plan agreed: **Resend + a domain the owner will buy**.
   - Owner buys domain (e.g. sampeerstudio.com) -> verify in Resend (SPF/DKIM/DMARC DNS).
   - Set `RESEND_API_KEY` + `RESEND_FROM` in `.env` -> `send-email.ts` auto-switches
     to Resend (code already done). Restart worker. Run an inbox test.
2. **More automations.** Add an entry to `app/automations.ts` + a page at its
   `href`. Use `status:"soon"` for a disabled placeholder card.
3. **Deploy** (README has steps): Vercel for web (needs TRIGGER_SECRET_KEY plus
   auth env vars), `npm run deploy:trigger` for the worker (set all
   worker env vars in dashboard).
4. Optional: shared top-nav (logo + back-to-hub) across automation pages.
5. Optional: production cookie `secure` is already gated on NODE_ENV - confirm
   HTTPS in prod so the session cookie is sent.

---

## 8. Quick verification commands

```bash
# auth gate
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:PORT/            # 307 -> /login
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:PORT/api/invoices -d '{}'  # 401

# trigger an invoice (needs a valid session cookie in real use)
# payload shape: see src/lib/schema.ts invoiceInputSchema
```

Do NOT use `lokeshkammara@gmail.com` anywhere (owner instruction).
