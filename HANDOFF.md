# Sampeer Automations — Handoff / Continuation Guide

Status snapshot for picking up this project (e.g. with Codex). Everything below
is **working and verified** unless marked PENDING.

---

## 1. What this is

A single-owner **automations dashboard** (`Sampeer Automations`) built on
**Next.js (frontend + API routes)** + **Trigger.dev (background worker)**.
First automation: an **AI Invoice Generator**.

Pipeline:
```
Next.js form (/invoice) → POST /api/invoices → Trigger.dev "generate-invoice":
  1. validate()        deterministic TypeScript (src/lib/validate.ts)
  2. computeTotals()   deterministic TypeScript (src/lib/calc.ts)  ← LLM never does math
  3. invoice-agent     Google Gemini, prose only (descriptions, notes, email copy)
  4. render-pdf        React-PDF → base64 (src/lib/invoice-pdf.tsx)
  5. send-invoice-email Resend (if configured) else Composio Gmail, PDF attached
Frontend polls GET /api/invoices/:runId until COMPLETED → shows package + PDF download.
```

**Core rule:** all money math + validation in TypeScript. Gemini only writes
prose. Totals can never be hallucinated.

---

## 2. Auth (single-owner magic link) — DONE

- Stateless: `jose` JWT + httpOnly cookie, **no database**.
- `middleware.ts` gates **every** route except `/login` and `/api/auth/*`
  (pages → redirect `/login`; api → 401).
- Only `OWNER_EMAIL` (syedmukheeth09@gmail.com) ever receives a magic link.
- Magic link emailed via Composio Gmail; 10-min token → sets 30-day session cookie.
- Files: `src/lib/auth.ts`, `middleware.ts`, `app/login/page.tsx`,
  `app/api/auth/{request,verify,logout}/route.ts`.
- Sign out: link in dashboard header → `/api/auth/logout`.

Verified: owner gets link, non-owner gets nothing (same response), cookie set,
protected routes 200 with cookie / 401 without.

---

## 3. File map

```
trigger.config.ts            project "proj_riwwwudaoobdfynosfrd", dirs ./src/trigger, machine small-2x
middleware.ts                auth gate (Edge)
src/lib/
  schema.ts                  zod input/output + InvoicePackage type
  validate.ts                required-field checks
  calc.ts                    totals math (+ round2, formatMoney)
  invoice-pdf.tsx            branded React-PDF document
  auth.ts                    jose sign/verify, isOwner, hasOwnerSession
src/trigger/
  generate-invoice.ts        orchestrator (schemaTask, entrypoint) + buildEmailBody() signature
  invoice-agent.ts           Gemini prose agent (model google("gemini-2.5-flash"))
  render-pdf.ts              PDF → base64
  send-email.ts              Resend OR Composio Gmail (auto-switch), clean filename, fallback
app/
  page.tsx                   DASHBOARD (reads automations registry) + Sign out
  automations.ts             REGISTRY — add new automations here (1 entry each)
  invoice/page.tsx           invoice automation page
  login/page.tsx             magic-link sign-in
  components/InvoiceForm.tsx  the invoice form (client) + polling
  api/invoices/route.ts             POST → triggers generate-invoice
  api/invoices/[runId]/route.ts     GET → poll run status/output
  api/auth/{request,verify,logout}/route.ts
test/calc.test.ts            totals unit tests (npm run test:calc — 5 pass)
```

---

## 4. Env vars (.env)

```
TRIGGER_SECRET_KEY=                 # set, working
GOOGLE_GENERATIVE_AI_API_KEY=       # set, working (Gemini)
COMPOSIO_API_KEY=                   # set, FULL-SCOPE key (ak_US…) — execute works
COMPOSIO_USER_ID=sampeer-studio     # Gmail connected ACTIVE under this entity
GMAIL_FROM=smpeer05@gmail.com       # the connected Gmail (sender)
RESEND_API_KEY=                     # EMPTY — set to switch sender to Resend (PENDING)
RESEND_FROM=Sampeer Studio <finance@sampeerstudio.com>
AUTH_SECRET=                        # set (random 48-byte)
OWNER_EMAIL=syedmukheeth09@gmail.com
# APP_URL optional — unset = auto request origin
```

Trigger.dev worker reads `.env` locally. For deploy, set the same vars in the
Trigger.dev dashboard (except TRIGGER_SECRET_KEY which is per-env).

---

## 5. Run locally

```bash
npm install
CI=false npx trigger.dev@4.4.6 dev      # worker — pin 4.4.6, CI=false avoids CI-abort
npx next dev                            # web — picks 3000/3001/3002 if busy
npm run test:calc                       # totals tests
npx tsc --noEmit                        # full typecheck (currently 0 errors)
```

Then open the printed `localhost:PORT`, sign in via magic link.

> NOTE: dev sometimes drifts ports (3000→3001→3002) because old `next dev`
> processes hold the port. Kill stragglers or just use the printed port.

---

## 6. Known gotchas (cost real time — see memory `composio-sdk-gotchas`)

- npm `composio` is a STUB. Real SDK = **`@composio/core`**.
- Composio `tools.execute` needs **`dangerouslySkipVersionCheck: true`** (`"latest"` is rejected).
- Composio Gmail **attachment** must be a staged `{name,mimetype,s3key}` descriptor:
  we use `composio.files.upload(...)` then override `.name`/`.mimetype` for a clean
  `Invoice-….pdf`. Needs a **full-scope** API key (scoped/read-only keys 401 on execute+upload).
- Pin all `@trigger.dev/*` to the CLI version (**4.4.6**) or dev aborts on mismatch.
- Test runner: `node --import tsx` (not `--loader`).

---

## 7. PENDING / next steps

1. **Email deliverability (spam fix).** Gmail-personal sends land in spam.
   Plan agreed: **Resend + a domain the owner will buy**.
   - Owner buys domain (e.g. sampeerstudio.com) → verify in Resend (SPF/DKIM/DMARC DNS).
   - Set `RESEND_API_KEY` + `RESEND_FROM` in `.env` → `send-email.ts` auto-switches
     to Resend (code already done). Restart worker. Run an inbox test.
2. **More automations.** Add an entry to `app/automations.ts` + a page at its
   `href`. Use `status:"soon"` for a disabled placeholder card.
3. **Deploy** (README has steps): Vercel for web (needs TRIGGER_SECRET_KEY plus
   auth/email-link env vars), `npm run deploy:trigger` for the worker (set all
   worker env vars in dashboard).
4. Optional: shared top-nav (logo + back-to-hub) across automation pages.
5. Optional: production cookie `secure` is already gated on NODE_ENV — confirm
   HTTPS in prod so the session cookie is sent.

---

## 8. Quick verification commands

```bash
# auth gate
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:PORT/            # 307 → /login
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:PORT/api/invoices -d '{}'  # 401

# trigger an invoice (needs a valid session cookie in real use)
# payload shape: see src/lib/schema.ts invoiceInputSchema
```

Do NOT use `lokeshkammara@gmail.com` anywhere (owner instruction).
