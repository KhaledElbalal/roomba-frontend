# Routes & data (adds to ../../CLAUDE.md — does not override it)

## Route map
Authenticated product screens live under the `(app)/` route group (shared chrome
via `(app)/layout.tsx` → `AppShell`):
- `/dashboard` — **Telemetry ★**
- `/runs` — Runs · `/runs/[id]` — **Run Detail ★** · `/runs/new` — New Run
- `/integrations` — Integrations · `/providers` — Providers

Public (no shell): `/` (landing), `/auth/[pathname]` (Neon AuthView).

## Shell contract
- Every authed page renders **inside** `(app)/layout.tsx` — never re-implement the
  sidebar/top bar. The top-bar title + mono eyebrow are derived from the route in
  `AppShell` (`ROUTE_META`); add an entry there for new routes.
- Pages own their own content `max-w` and render content only.

## Auth gate
`AppShell` redirects to `/auth/sign-in` when there's no session (the one
user-facing contract). Pages under `(app)/` can assume a session exists, so
TanStack queries there can run unconditionally.

## Data
- TanStack Query only; derive keys from `src/lib/query-keys.ts` (never hand-write
  key arrays). Typed fetch via `src/lib/api.ts` (`apiFetch`, throws `ApiError`).
- Poll runs (`refetchInterval` ~2s) while any run is `running`/`queued`; **stop
  polling on terminal states**.
- Telemetry: one range control (7d/30d/90d) is the single source of truth — every
  query on the page keys off it.

## Required states (every page)
Handle loading / error / empty. **Empty states route** (use `RouteEmptyState`),
they never dead-end. "Not enough data" is a real state (`NotEnoughData`), not an
error. Surface backend 422s inline (`ApiError.code` / `.fieldErrors`).

## Next 16 / RSC
See the `nextjs-app-router` skill. Keep `'use client'` to small leaves; `params`
is async (`await params`). Don't add `use cache` (cacheComponents is off here).
