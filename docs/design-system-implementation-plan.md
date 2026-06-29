# Roomba Frontend — Design-System Implementation Plan

Synthesized from the `design_handoff_roomba/` handoff + a gap analysis of the current
`roomba-frontend`. Goal: adopt the dark-first Roomba brand theme, build the six product
screens, and make the design system *stick* via scoped `CLAUDE.md` files + skills.

## Context

The handoff (`design_handoff_roomba/`) is a **working shadcn/Tailwind-v4 theme**, not just
docs: dark-first, near-monochrome + one signal blue (`#4C8DFF`), Space Grotesk (UI) +
JetBrains Mono (numerics/labels), a 240px sidebar + 60px top-bar shell, and six screens
(Integrations → Providers → New Run → Runs → **Run Detail ★** → **Telemetry ★**). The two
★ screens carry the product story ("instrument, not infographic"). `Roomba App.html` is the
clickable high-fidelity reference; recreate in Next.js + shadcn — don't ship the HTML.

The current app is a neutral light-mode theme, a top-bar-only shell (`max-w-3xl`),
`@base-ui/react`-based UI components, and 4 routes (home, auth, dashboard-debug,
settings/integrations). The **data layer is already mature and reusable**:
`src/lib/{api,types,query-keys,integrations,auth,auth-server}.ts` already model every
screen's data and keys.

## Key decisions

1. **Migrate to standard Radix shadcn (new-york) — not keep `@base-ui`.** Only
   `src/components/ui/button.tsx` actually uses `@base-ui` today (via `render`/`nativeButton`
   at 3 call sites: `app-shell.tsx`, `page.tsx`, `integration-card.tsx`); `card.tsx`/`input.tsx`
   are token-styled plain elements. The handoff's whole workflow is `npx shadcn@latest add …`
   (new-york/Radix) → inherits the theme. We need ~12 net-new primitives (sidebar, dialog,
   table, select, command, tabs, badge, progress, tooltip…); keeping Base UI turns every
   `add` into a manual port. One-time cost: rewrite `button.tsx` to Radix/Slot, convert 3
   `render=`→`asChild` sites, re-add card/input, drop `@base-ui/react`. The data layer and
   `IntegrationCard` logic port unchanged.
2. **Sidebar + top-bar shell in an `(app)/` route group.** Full-width, not `max-w-3xl`.
   Replaces the current `app-shell.tsx`.
3. **Charts: install `recharts`** (project stack lib) themed via `--chart-1..5`; honest axes,
   gridlines, units, dashed prior-period baselines.
4. **Persist the design system via 4 scoped `CLAUDE.md` files** (below) + the two new skills.

## ⚠️ Load-bearing caveats (don't regress prior fixes)

- **Preserve the `neon-ui` cascade layer.** `globals.css` declares
  `@layer theme, base, neon-ui, components, utilities;` and imports
  `@neondatabase/auth/ui/css` into `layer(neon-ui)`. This stops Neon Auth's unlayered
  `*{padding:0}` preflight from clobbering app spacing. **Merge the handoff tokens INTO the
  existing file — never overwrite it** with the handoff's `globals.css` (which lacks this).
- **Font-variable wiring must match exactly.** The `@theme` `--font-*` names must equal the
  `next/font` `variable:` names (`--font-space-grotesk`, `--font-jetbrains-mono`) or text
  silently falls back to system fonts. (We already hit the circular `--font-sans` bug once.)
- **Convert all 3 Button call sites before removing `@base-ui/react`**, or typecheck fails.
- **`RunStatus` needs `timed_out`** (amber) — handoff/prototype use it; `types.ts` lacks it.
- **Cost/decimal fields are strings** (`cost_usd`, `max_cost_usd`) — parse before formatting.
- **Cost-by-provider:** group by *provider*; `by_group[].spend_usd` is null for model grouping
  (see `[[project-cost-query-token-key-mismatch]]`).

## Phase 1 — Foundations (theme, fonts, dark, brand, component lib)

In dependency order; run `tsc`/`eslint`/`build` + Playwright check after each.

1. **Theme swap** — replace the `:root` + `.dark` token blocks in `src/app/globals.css` with
   the handoff's blue OKLCH tokens; add `--void`, `--signal`, `--destructive-foreground`, the
   blue chart ramp, and `roomba-pulse`/`roomba-fade` keyframes. Keep the `@layer …neon-ui…`
   line and the layered Neon import.
2. **Fonts** — add `src/app/fonts.ts` (Space Grotesk + JetBrains Mono); update `layout.tsx`
   imports; rewire `@theme` `--font-sans`/`--font-mono`/`--font-heading`. Remove Geist.
3. **Activate dark** — add `dark` to `<html className>` in `layout.tsx` (keep
   `suppressHydrationWarning`). Verify Neon `AuthView` + `IntegrationCard` read on dark.
4. **Brand** — copy `design_handoff_roomba/brand/` → `public/brand/`; add
   `src/components/roomba-logo.tsx`; wire `metadata.icons`/`openGraph`; lowercase **roomba**.
5. **Component-lib migration (Option B)** — set `components.json` to new-york/slate (keep
   `src/app/globals.css` path + aliases); rewrite `button.tsx` (Radix/Slot); convert the 3
   `render=`→`asChild` sites; re-add `card`/`input`; remove `@base-ui/react`; add `recharts`.

## Phase 2 — Shell + shared primitives

6. **`(app)/` route group + shell** — `(app)/layout.tsx` = `AppSidebar` (240px, `bg-card`,
   `RoombaLockup`, nav Dashboard/Runs/Integrations/Providers w/ active = `bg-primary/12` +
   hairline primary border, user footer from `/api/me`) + `TopBar` (60px, title + mono
   eyebrow + persistent **New Run** button + avatar). Server layout with a client nav island
   (`usePathname`). Enforce the auth gate (expired JWT → sign-in) in the layout.
7. **Shared primitives** (unblock every screen, lock the visual language):
   `StatusBadge` (status color map incl. `timed_out`; only non-blue palette), `LiveDot`
   (pulsing = live), `MonoCell` (right-aligned tabular-nums; cost-in-signal variant),
   `LedgerCard`/`StatTile`, `GuardrailMeter` (current `/` ceiling; red + "ceiling reached"
   when tripped), `RouteEmptyState` (empty states route, never dead-end), `NotEnoughData`.

## Phase 3 — Screens (build order)

Routes live under `(app)/`. Hooks build on existing `apiFetch` + `queryKeys`.

1. **Runs** `/runs` — dense `Table`: status · issue · repo · started · duration · cost · PR;
   status filter; pagination; **~2s poll while any row running/queued**; row → detail.
   Lowest-risk real screen; proves the polling pattern. (new `lib/runs.ts`)
2. **Run Detail ★** `/runs/[id]` — header `LedgerCard` (status/issue/repo/PR + stat row with
   cost-in-signal + two `GuardrailMeter`s) → trace waterfall on a shared time axis
   (`llm_call`=blue+cost chip, tool/git=gray, error=red; fallback `↳ model` + tripped-bound
   flags inline; each span expands to a JetBrains-Mono terminal block). Live: append + **pin
   to newest unless user scrolled up**; running total ticks; failed/timed_out surfaces the
   tripped bound. Poll run + artifacts while non-terminal.
3. **Telemetry ★** `/dashboard` — one `RangeControl` (7d/30d/90d) drives every query;
   `FleetStrip` (in-flight pulsing / queued / concurrency `1/4` + slot bar / success / avg
   cost); DORA row (value + delta-vs-prior + real inline trend w/ dashed baseline; hide
   deltas + show `NotEnoughData` below threshold); Recharts runs-bars + cost-area + cost-by-
   provider, all with axes/units/dashed baseline. (new `lib/metrics.ts`)
4. **New Run** `/new` — issue + repo `Command` comboboxes, enabled-only provider picker
   (fallback chain read-only), bounds (max cost/iter/timeout, pre-filled), **"authorizing max
   spend $X"** readout; submit disabled until issue+repo+provider; 422s inline; empty deps
   **route** to Integrations/Providers. On success → `/runs/[id]`.
5. **Integrations** `/integrations` — port existing `IntegrationCard` + hooks; add the
   run-unlock gate line; restyle to handoff anatomy; move route from `/settings/integrations`.
6. **Providers** `/providers` — ordered fallback-chain list (reorder ▲/▼, provider/model,
   "key set ✓" never the value, enabled `Switch`), add form (write-only key), replace-key,
   delete-confirm. (new `lib/providers.ts`)

Delete/repurpose the current `/dashboard` debug page (Telemetry takes `/dashboard`).

## Design-system persistence — CLAUDE.md plan

Four concise, non-duplicating files; each adds to (never overrides) the one above. Each opens
with a one-line pointer up to the root, and the rule: *"On conflict the deeper file wins for
its own concern; the root's design-token + dark-first rules are absolute."*

- **`roomba-frontend/CLAUDE.md`** — keep `@AGENTS.md` import; append the **Design System
  (non-negotiables)**: semantic tokens only (no hex; `bg-background/card/popover`,
  `text-foreground/muted-foreground`, `bg-primary text-primary-foreground`, `bg-void`/
  `text-signal` only when no token fits); one blue + lots of dark, never a new accent;
  dark-first; type (Space Grotesk / JetBrains Mono, uppercase mono labels, lowercase
  **roomba**); *instrument, not infographic* (color is signal; numerics mono/right-aligned;
  honest charts; guardrails always visible); showpieces (Run Detail, Telemetry); logo &
  restraint. Pointers to the scoped files + `design_handoff_roomba/{SCREENS.md,Roomba App.html}`.
- **`src/app/CLAUDE.md`** — route map (the six `(app)/` routes); shell contract (pages render
  inside `(app)/layout.tsx`, set title/eyebrow, own their `max-w`, never re-implement chrome);
  auth gate; TanStack Query (keys from `query-keys.ts`; poll runs ~2s; Telemetry range-driven);
  every page handles loading/error/empty; empty states route; "not enough data" is real.
- **`src/components/CLAUDE.md`** — composite/app components live here, primitives in `ui/`;
  compose don't restyle; use `MonoCell`/`StatusBadge`/`LiveDot`; canonical status color map;
  guardrails render the ceiling alongside; showpiece behaviors (trace pin-to-newest; honest
  charts; write-only secrets never displayed).
- **`src/components/ui/CLAUDE.md`** — generated `shadcn add` zone (new-york/lucide), inherits
  theme; **do not hand-restyle / hardcode hex**; keep edits minimal so re-adds don't clobber.

## Skills added (this change)

- `roomba-frontend/.claude/skills/nextjs-app-router/SKILL.md` — Next 16 App Router practices
  (server/client boundaries, async params, caching model w/ `cacheComponents` OFF here,
  streaming, route handlers, TanStack Query + RSC). Auto-loads on `src/app|components|lib`.
- `roomba-frontend/.claude/skills/vercel-deploy/SKILL.md` — Vercel perf/deploy (Core Web
  Vitals, image/font opt, cache headers, env vars, edge vs node, Speed Insights).

## Verification

After each phase: `npx tsc --noEmit`, `npm run lint`, `npm run build` (Turbopack), then dev
server on :3001 + Playwright MCP screenshots compared against `design_handoff_roomba/Roomba
App.html` — especially dark surfaces, font rendering, and the two ★ showpieces. Re-check the
`neon-ui` interaction at `/auth/sign-in` and `/integrations` after the theme/dark swap (most
likely regression points). Stop run polling on terminal states to avoid runaway requests.
