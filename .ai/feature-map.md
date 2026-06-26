# Feature Map

Per-automation ownership. Path root = `features/<os-id>/<slug>/`. Page = `app/(app)/<route>/page.tsx`. Machine-readable: [features.json](features.json).

Legend — **Kind**: `pipeline` (Trigger+Gemini+PDF+email) · `kv` (Next API + kv CRUD) · `client` (browser-only TS).

## BusinessOS
| Automation | slug | route | kind | key files |
|-----------|------|-------|------|-----------|
| Invoice Generator | invoice-generator | /business-os/invoice-generator | pipeline | api/handlers.ts · trigger/{generate-invoice,invoice-agent,render-pdf,send-email}.ts · prompts/invoice-agent.ts · utils/{schema,validate,calc,invoice-pdf} · components/{InvoiceAutomationView,InvoiceForm} |
| Proposal Generator | proposal-generator | /business-os/proposal-generator | pipeline | trigger/{generate-proposal,proposal-agent,render-proposal-pdf,send-proposal-email}.ts · utils/* · components/{ProposalAutomationView,ProposalForm} |
| Expense Tracker | expense-tracker | /business-os/expense-tracker | pipeline | trigger/{track-expenses,expense-agent,render-expense-pdf}.ts · utils/{csv,calc,…} · components/{ExpenseAutomationView,ExpenseForm} |
| GST / Tax Calculator | gst-calculator | /business-os/gst-calculator | client | utils/calc.ts · utils/gst-pdf.tsx · components/{GstCalculatorView,GstCalculator} |
| Client CRM | client-crm | /business-os/client-crm | kv | service.ts (key `crm-clients`) · utils/{health,schema} · components/ClientCrmView |
| Project Dashboard | project-dashboard | /business-os/project-dashboard | kv | service.ts (key `projects`) · utils/{status,schema} · components/ProjectDashboardView |

## ContentOS
| Automation | slug | route | kind | key files |
|-----------|------|-------|------|-----------|
| Video Factory | video-factory | /content-os/video-factory | client | utils/script.ts `buildScript()` · components/{VideoFactoryView,VideoFactory} |
| SEO Writer | seo-writer | /content-os/seo-writer | client | utils/seo.ts · components/{SeoWriterView,SeoWriter} |
| Repurpose Engine | repurpose-engine | /content-os/repurpose-engine | client | utils/repurpose.ts · components/{RepurposeEngineView,RepurposeEngine} |
| Trend Hunter | trend-hunter | /content-os/trend-hunter | client | utils/angles.ts `generateAngles()` · components/{TrendHunterView,TrendHunter} |

## SalesOS
| Automation | slug | route | kind | key files |
|-----------|------|-------|------|-----------|
| Lead Pipeline | lead-pipeline | /sales-os/lead-pipeline | kv | service.ts (key `leads`) · utils/{score,schema} · components/LeadPipelineView |
| Cold Email Generator | cold-email | /sales-os/cold-email | client | utils/generate.ts · utils/cold-email-pdf.tsx · components/{ColdEmailView,ColdEmailGenerator} |
| Meeting Summary | meeting-summary | /sales-os/meeting-summary | client | utils/summarize.ts `summarize()` · components/{MeetingSummaryView,MeetingSummary} |

## GrowthOS
| Automation | slug | route | kind | key files |
|-----------|------|-------|------|-----------|
| Growth Analytics | analytics | /growth-os/analytics | client | utils/calc.ts (CAC/ROAS/ROI) · utils/analytics-pdf.tsx · components/{GrowthAnalyticsView,GrowthAnalytics} |
| Website Health | website-health | /growth-os/website-health | client | utils/audit.ts `auditSite()` · components/{WebsiteHealthView,WebsiteHealth} |
| Competitor Radar | competitors* | /growth-os/competitor-radar | kv | service.ts (key `competitors`) · utils/{score,schema} · components/CompetitorRadarView |

\* registry slug is `competitors`; folder/route is `competitor-radar`.

## Upgrade swap-points (client/kv → LLM/live)
meeting-summary → `summarize()` · video-factory → `buildScript()` · trend-hunter → `generateAngles()` · website-health → `auditSite()` · competitor-radar → add fetch enricher in `service.ts`. Keep I/O types; move call behind API/Trigger; View unchanged.
