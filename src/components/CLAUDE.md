# Components (adds to ../../CLAUDE.md — does not override it)

## What lives where
- `ui/` — generated shadcn primitives (Button, Card, Input, Badge…). Don't
  hand-restyle them (see `ui/CLAUDE.md`).
- `instrument/` — the Roomba "instrument" design-language primitives. Reuse these
  rather than re-deriving the look:
  - `StatusBadge` — run status pill; its color map is the **canonical** status
    palette and the only non-blue color in the app.
  - `LiveDot` — pulsing blue dot = live/active.
  - `MonoCell` — right-aligned mono numeric (cost/duration/count/timestamp).
  - `GuardrailMeter` — current/ceiling leash bar (red + "ceiling reached" when tripped).
  - `StatTile`, `RouteEmptyState`, `NotEnoughData`.
- Everything else here = composite, app-specific components (shell, integration
  card, future trace/telemetry pieces).

## Rules
- **Compose, don't restyle.** Build on `ui/` primitives + `instrument/` parts;
  pass brand intent via `className` tokens. Don't fork a primitive to recolor it.
- Use semantic tokens only (see root `CLAUDE.md`); no hardcoded hex.
- **Numerics** → `MonoCell`. **Run status** → `StatusBadge` (don't invent new
  status colors). **Cost/iteration limits** → always render the ceiling via
  `GuardrailMeter`.
- **Secrets are write-only**: token/API-key inputs are `type="password"` and never
  re-displayed after submit — only connected status persists.
- Showpiece behaviors: the trace pins to newest unless the user scrolled up;
  charts always carry axes + units + a dashed baseline.
- Client vs server: mark interactive components `'use client'`; keep them small.
