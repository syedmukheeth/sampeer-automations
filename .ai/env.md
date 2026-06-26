# Environment Variables

Source of truth: `.env.example`. Verified against `process.env.*` usages in code.

## Web app (Vercel) — required to run the dashboard
| Var | Used by | Purpose |
|-----|---------|---------|
| `AUTH_SECRET` | shared/services/auth.ts | Signs the owner session JWT. `openssl rand -base64 48`. Required or auth throws. |
| `AUTH_USERNAME` | auth.ts | Owner login id |
| `AUTH_PASSWORD` | auth.ts | Owner login password |
| `TRIGGER_SECRET_KEY` | server routes / runs.ts | Trigger task trigger + poll + run history. Needed for pipeline automations & dashboard metrics. |

## Trigger.dev worker — required by the background pipelines
| Var | Used by | Purpose |
|-----|---------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | trigger/*-agent.ts | Gemini prose agent (`@ai-sdk/google`) |
| `RESEND_API_KEY` | trigger/send-*email.ts | **Preferred** email sender |
| `RESEND_FROM` | send-*email.ts, settings.ts | Resend from-address |
| `COMPOSIO_API_KEY` | send-*email.ts | Gmail **fallback** sender (when Resend unset) |
| `COMPOSIO_USER_ID` | send-*email.ts | Composio connected-account id |
| `GMAIL_FROM` | settings.ts default | Optional Gmail sender reference |

## Optional white-label defaults (settings.ts seeds)
`COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_PHONE`, `COMPANY_LOGO_URL` — seed default branding when no settings saved. All have fallbacks; safe to omit.

## Notes
- Email: if `RESEND_API_KEY`+`RESEND_FROM` set → Resend; else fall back to Composio Gmail. See [business-logic.md](business-logic.md).
- `NODE_ENV` read in auth/login/logout/settings routes for cookie `secure` flag.
- Files present locally: `.env`, `.env.local`, `.env.example`. Only `.env.example` is tracked.
- Composio key gotcha: see memory `composio-sdk-gotchas`.
