# Sampeer Studio Invoice Agent

Next.js form -> Trigger.dev pipeline -> branded PDF -> email via Resend or Composio Gmail.

```text
Next.js form -> POST /api/invoices -> generate-invoice (Trigger.dev)
                                  1. validate() - deterministic TypeScript
                                  2. computeTotals() - deterministic TypeScript
                                  3. invoice-agent - Google Gemini prose only
                                  4. render-pdf - React-PDF to base64
                                  5. send-invoice-email - Resend or Composio Gmail

Frontend polls GET /api/invoices/:runId for the completed invoice package and PDF.
```

## Design Rule

All money math and field validation happen in TypeScript. The AI model only writes prose: premium line-item descriptions, notes, and client email copy. The model never sees or produces invoice numbers, prices, taxes, discounts, or totals.

## Structure

| Path | Role |
| --- | --- |
| `src/lib/schema.ts` | Zod input/output schemas and `InvoicePackage` type |
| `src/lib/validate.ts` | Deterministic required-field checks |
| `src/lib/calc.ts` | Totals: subtotal, discount, tax, total, paid, remaining |
| `src/lib/invoice-pdf.tsx` | Branded React-PDF document |
| `src/trigger/invoice-agent.ts` | Google Gemini prose agent |
| `src/trigger/render-pdf.ts` | PDF rendering task |
| `src/trigger/send-email.ts` | Resend sender with Composio Gmail fallback |
| `src/trigger/generate-invoice.ts` | Trigger.dev orchestrator task |
| `app/` | Next.js form and API routes |
| `test/calc.test.ts` | Totals unit tests |

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template:

   ```bash
   cp .env.example .env
   ```

3. Fill `.env`:

   - `TRIGGER_SECRET_KEY`: Trigger.dev secret key.
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Google AI Studio or Gemini API key.
   - `RESEND_API_KEY` and `RESEND_FROM`: recommended production sender.
   - `COMPOSIO_API_KEY` and `COMPOSIO_USER_ID`: Gmail fallback sender.
   - `GMAIL_FROM`: optional reference sender for Gmail setup.

4. Confirm `project` in `trigger.config.ts` matches your Trigger.dev `proj_...` ref.

5. If using Composio Gmail, authorize Gmail for `COMPOSIO_USER_ID` in the Composio dashboard so the account is active.

## Local Run

Run the Trigger.dev worker and Next.js app in two terminals:

```bash
npm run dev:trigger
npm run dev
```

The app runs on `http://localhost:3000`.

## Validation

```bash
npm test
npm run build
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repo.
3. Keep the framework preset as `Next.js`.
4. Use these build settings:

   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: leave empty/default

5. Add these Vercel environment variables:

   - `TRIGGER_SECRET_KEY`
   - `AUTH_SECRET`
   - `OWNER_EMAIL`
   - `COMPOSIO_API_KEY`
   - `COMPOSIO_USER_ID`
   - `APP_URL` set to the deployed site URL

The AI, PDF, and invoice email work happens inside Trigger.dev. The web app still
needs the auth variables so it can create and email owner sign-in links.

## Deploy Trigger.dev

Add these environment variables in your Trigger.dev project:

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `COMPOSIO_API_KEY`
- `COMPOSIO_USER_ID`
- `GMAIL_FROM`

Then deploy the worker:

```bash
npm run deploy:trigger
```

Recommended email setup: use Resend with a verified domain for production deliverability. If `RESEND_API_KEY` and `RESEND_FROM` are not set, the worker falls back to Composio Gmail.

## Runtime Output

`generate-invoice` returns JSON with `validation`, `invoice`, `company`, `client`, `project`, `items`, `summary`, `payment`, `notes`, `email`, `pdfBase64`, `pdfFilename`, and `emailSent`.

On missing fields it returns:

```json
{ "validation": { "success": false, "errors": [] } }
```
