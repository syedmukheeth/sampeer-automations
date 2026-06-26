# Routes (UI pages)

All `(app)/*` pages are gated by [middleware.ts](../middleware.ts) (owner session). `/login` is public. Pages are server components unless they end in a `*View`/`Form` client component.

| Path | File | Renders |
|------|------|---------|
| `/login` | app/login/page.tsx | Login form → POST /api/auth/login |
| `/` | app/(app)/page.tsx | Dashboard: registry KPIs + recent runs (runs.ts) |
| `/library` | app/(app)/library/page.tsx | Marketplace; install toggles → /api/installs |
| `/settings` | app/(app)/settings/{page,SettingsForm}.tsx | White-label branding + invoice defaults |
| `/business-os/invoice-generator` | …/page.tsx | InvoiceAutomationView (Trigger pipeline) |
| `/business-os/proposal-generator` | …/page.tsx | ProposalAutomationView (Trigger pipeline) |
| `/business-os/expense-tracker` | …/page.tsx | ExpenseAutomationView (Trigger pipeline) |
| `/business-os/gst-calculator` | …/page.tsx | GstCalculatorView (client-only) |
| `/business-os/client-crm` | …/page.tsx | ClientCrmView (kv CRUD) |
| `/business-os/project-dashboard` | …/page.tsx | ProjectDashboardView (kv CRUD) |
| `/content-os/video-factory` | …/page.tsx | VideoFactoryView (client-only) |
| `/content-os/seo-writer` | …/page.tsx | SeoWriterView (client-only) |
| `/content-os/repurpose-engine` | …/page.tsx | RepurposeEngineView (client-only) |
| `/content-os/trend-hunter` | …/page.tsx | TrendHunterView (client-only) |
| `/sales-os/lead-pipeline` | …/page.tsx | LeadPipelineView (kv CRUD) |
| `/sales-os/cold-email` | …/page.tsx | ColdEmailView (client-only) |
| `/sales-os/meeting-summary` | …/page.tsx | MeetingSummaryView (client-only) |
| `/growth-os/analytics` | …/page.tsx | GrowthAnalyticsView (client-only) |
| `/growth-os/website-health` | …/page.tsx | WebsiteHealthView (client-only) |
| `/growth-os/competitor-radar` | …/page.tsx | CompetitorRadarView (kv CRUD) |

**Page → automation slug**: the page directory under `app/(app)/<os-id>/<slug>/` matches `href` in [registry.ts](../features/registry.ts). Exception: Competitor Radar registry slug is `competitors` but its route/folder is `competitor-radar`.

For the HTTP/API surface see [api-map.md](api-map.md).
