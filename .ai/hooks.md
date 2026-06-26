# Hooks

This repo defines **no custom React hooks** of its own (no `use*` files). Interactivity lives inside each feature's `*View.tsx` component using built-in and library hooks.

## Patterns used
| Hook | Where | Why |
|------|-------|-----|
| `useMemo` | client-only Views (gst, seo, repurpose, trend, video, cold-email, meeting, analytics, website-health) | Recompute the deterministic engine output from form inputs. Engine lives in the feature's `utils/`. |
| `useState` / `useEffect` | most Views | Local form state; polling loops |
| polling (fetch loop in `useEffect`) | pipeline Views (invoice, proposal, expense) | Hit `GET /api/<x>/[runId]` until `isCompleted`/`isFailed` |
| `@trigger.dev/react-hooks` | available (dependency) for live run subscription | Not required by current Views, which poll the REST route |

## Upgrade note
To convert a client-only automation to a server/LLM-backed one, keep the engine's input/output types, move the call behind an API route or Trigger task, and have the View `fetch` + poll instead of `useMemo`. The component contract stays the same. See HANDOFF.md §7 and [feature-map.md](feature-map.md).
