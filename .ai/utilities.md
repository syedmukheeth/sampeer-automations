# Utilities

## Shared — `shared/lib/`
| File | Exports | Use |
|------|---------|-----|
| `cn.ts` | `cn()` | clsx + tailwind-merge classname combiner |
| `format.ts` | money/number/date/time-ago formatters (client-safe) | Display formatting |
| `motion.ts` | framer-motion variants/presets | Animations, `PageTransition` |

## Feature engines — `features/<os>/<slug>/utils/`
Every automation's logic is a **pure, deterministic, unit-tested** module here. This is the "swap point" to upgrade an automation to LLM/live-data (keep types, change impl). Each has a matching `test/*.test.ts`.

| Automation | Engine file → entry fn | Test |
|------------|------------------------|------|
| invoice-generator | `utils/calc.ts` `computeTotals`,`formatMoney` · `utils/validate.ts` `validateInput` · `utils/schema.ts` (zod) · `utils/invoice-pdf.tsx` | calc.test.ts |
| proposal-generator | `utils/calc.ts` · `utils/validate.ts` · `utils/schema.ts` · `utils/proposal-pdf.tsx` | (calc) |
| expense-tracker | `utils/calc.ts` · `utils/csv.ts` · `utils/validate.ts` · `utils/schema.ts` · `utils/expense-pdf.tsx` | expense-calc.test.ts |
| gst-calculator | `utils/calc.ts` (GST/CGST/SGST/IGST, incl/excl) · `utils/gst-pdf.tsx` | gst-calc.test.ts |
| client-crm | `utils/health.ts` (health score) · `utils/schema.ts` | crm-health.test.ts |
| project-dashboard | `utils/status.ts` (on-track/at-risk) · `utils/schema.ts` | project-status.test.ts |
| lead-pipeline | `utils/score.ts` (weighted forecast, win rate) · `utils/schema.ts` | lead-score.test.ts |
| competitor-radar | `utils/score.ts` (threat index) · `utils/schema.ts` | competitor-radar.test.ts |
| cold-email | `utils/generate.ts` (4-touch sequence) · `utils/cold-email-pdf.tsx` | cold-email.test.ts |
| meeting-summary | `utils/summarize.ts` `summarize()` | meeting-summary.test.ts |
| seo-writer | `utils/seo.ts` (on-page scorer) | seo-analyze.test.ts |
| repurpose-engine | `utils/repurpose.ts` | repurpose.test.ts |
| trend-hunter | `utils/angles.ts` `generateAngles()` | trend-angles.test.ts |
| video-factory | `utils/script.ts` `buildScript()` | video-script.test.ts |
| analytics | `utils/calc.ts` (CAC/ROAS/ROI) · `utils/analytics-pdf.tsx` | growth-analytics.test.ts |
| website-health | `utils/audit.ts` `auditSite()` (CWV+SEO grade) | website-audit.test.ts |

## PDF utilities (`*-pdf.tsx`)
React-PDF documents. Pipeline features render them inside a Trigger `render-*-pdf` task → base64; client-only features (gst, cold-email, analytics) render/download in-browser.

## Tests — `test/`
`npm test` runs `node --import tsx --test test/*.test.ts` (74 tests). Every deterministic engine above is covered. Run after any logic change.

See [search-index.json](search-index.json) for exact symbol → file lookups.
