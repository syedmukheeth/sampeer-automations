# Business Logic

## The one rule
**Deterministic TypeScript owns all numbers and validation. The LLM only writes prose / assigns labels.** The model never sees or produces invoice numbers, prices, taxes, discounts, totals, or scores. This is enforced by pipeline ordering (validate+calc run before the agent; agent output is merged in for descriptions/notes/email copy only).

## Trigger pipeline (invoice / proposal / expense)
```
form → POST /api/x → applySettings() (branding+defaults merged in) → tasks.trigger
  orchestrator task (generate-invoice / generate-proposal / track-expenses):
    1. validate()      deterministic required-field checks   → fail = return errors, stop
    2. computeTotals() deterministic money math               (expense: csv parse + categorize totals)
    3. agent (Gemini)  prose ONLY: premium line descriptions, notes, client email copy
    4. assemble package (numbers from step 2, prose from step 3; manual overrides win)
    5. render-*-pdf    React-PDF → base64
    6. send-*-email    Resend (preferred) → Composio Gmail (fallback)
  returns full package + pdfBase64 + emailSent + runId
client polls GET /api/x/[runId] → renders when COMPLETED
```
Settings injection (`applySettings` in `api/handlers.ts`): form values win, saved settings fill gaps → same automation reskins per client with no code change; worker stays stateless (branding travels in payload).

## kv CRUD data-app (crm / projects / leads / competitors)
`service.ts` = list/save/delete over kv. On read, every record re-parsed through its zod schema (fills defaults for old records, sorts). Derived metric computed by the feature's `utils/`:
- client-crm → health score · project-dashboard → on-track/at-risk · lead-pipeline → probability-weighted forecast + win rate · competitor-radar → threat index.

## Client-only (instant) automations
Pure engine in `utils/`, recomputed in the View via `useMemo` from form inputs. No persistence, no network. PDF (where present) rendered + downloaded in-browser. These mirror the gst-calculator recipe.

## Auth / access
Single owner. `middleware.ts` gates every page+API except `/login` & `/api/auth/*`. Session = `jose` JWT in httpOnly cookie, 30d. Marketplace: only **installed** automations appear in the shell; each page also gates on install state (`InstallRequired`).

## Email provider selection
`RESEND_API_KEY` + `RESEND_FROM` present → send via Resend. Otherwise → Composio Gmail (`COMPOSIO_API_KEY`/`COMPOSIO_USER_ID`). Send failure does **not** fail the run — the PDF/package is still returned with `emailSent:false`.

## Upgrade paths (HANDOFF §7)
Client-only/kv engines are designed to be swapped for LLM/live-data behind the same input/output types. Swap points listed in [feature-map.md](feature-map.md).
