# Components

## Shared design system — `shared/ui/` (barrel: `shared/ui/index.ts`)
Import from `@shared/ui`. Use these before building new UI.

| Component | Purpose |
|-----------|---------|
| `Card`, `CardBody` | Base surface |
| `Button` | Primary/secondary actions |
| `StatusBadge` | live/soon/run-status pills |
| `StatCard` | KPI tile (dashboard + automation headers) |
| `SectionHeader`, `PageHeader` | Page/section titles |
| `AutomationCard` | Library/dashboard automation tile (from registry meta) |
| `AutomationPageLayout` | **Standard automation page chrome** — tabs + stat row + content slot. Most automation Views render inside this. Types: `AutomationTab`, `AutomationStat`. |
| `EmptyState` | Zero-data placeholder |
| `ActivityTimeline` (`ActivityItem`) | Recent runs / activity feed |
| `LogViewer` (`LogLine`) | Streaming run logs |
| `ChartCard` | Chart container |
| `BrandLogo` | Brand mark |

Not in barrel (import direct): `InstallRequired`, `InstallToggle`, `StatusBadge` extras, `PageTransition` (framer-motion route transition, used in `(app)/layout`).

## Navigation — `shared/navigation/`
- `Sidebar.tsx` — exports `Sidebar` + `MobileNav`. Renders OS→module→automation tree from `registry.ts`, filtered by `installed` slugs (passed from `(app)/layout`).
- `Topbar.tsx` — top bar.

## Charts — `shared/charts/`
`LineChart.tsx`, `Sparkline.tsx` (lightweight SVG; used by analytics & dashboard).

## Feature components — `features/<os>/<slug>/components/`
Each automation has a `*View.tsx` that **orchestrates** the feature (state, calls its engine via `useMemo`, or polls its API). Pipeline features also have a `*Form.tsx`. Naming:
- Pipeline: `InvoiceAutomationView`, `ProposalAutomationView`, `ExpenseAutomationView` (+ `*Form`)
- kv CRUD: `ClientCrmView`, `ProjectDashboardView`, `LeadPipelineView`, `CompetitorRadarView`
- client-only: `GstCalculatorView`, `VideoFactoryView`, `SeoWriterView`, `RepurposeEngineView`, `TrendHunterView`, `ColdEmailView`, `MeetingSummaryView`, `GrowthAnalyticsView`, `WebsiteHealthView` (several wrap an inner widget, e.g. `GstCalculator`, `SeoWriter`, `ColdEmailGenerator`, `MeetingSummary`).

**Convention**: the page (`app/(app)/…/page.tsx`) is a thin server component that renders the feature's `*View`. The View owns interactivity. To change behavior, edit the View / its `utils/` engine — not the page.

Full per-component list with locations → [search-index.json](search-index.json).
