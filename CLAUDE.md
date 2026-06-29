@AGENTS.md

# Roomba frontend — design system

Dark-first, near-monochrome, one signal blue. The brand is wired into shadcn's
CSS variables in `src/app/globals.css`; build with standard shadcn components
(new-york / lucide) — they inherit it. This is absolute; scoped `CLAUDE.md` files
deeper in the tree add specifics but don't override it.

> Scoped: `src/app/CLAUDE.md` (routes/data/states), `src/components/CLAUDE.md`
> (composition), `src/components/ui/CLAUDE.md` (generated primitives).

## Semantic tokens only
- Surfaces: `bg-background` (page) · `bg-card` · `bg-popover`.
- Text: `text-foreground` · `text-muted-foreground` (secondary + mono labels).
- Primary action: `bg-primary text-primary-foreground`. Borders: `border-border`.
  Focus: `ring-ring`. Brand extras only when no token fits: `bg-void`, `text-signal`.
- **Never hardcode hex. Never add a new accent color. One blue, lots of dark.**

## Dark-first
`<html className="dark">` (forced via the theme provider). Don't assume light
backgrounds; only build a light toggle if asked.

## Type
- `font-sans` = Space Grotesk (UI/display); `font-mono` = JetBrains Mono (code,
  metadata, labels, timestamps, **all numerics**).
- Mono labels: uppercase, `tracking-[0.16em] text-muted-foreground`.
- Headings: semibold, tight tracking. The product name is lowercase: **roomba**.

## Instrument, not infographic
- **Color is signal, not decoration.** Status colors (green/amber/red) appear only
  on status, via `StatusBadge`. Never tint cards or charts for flavor.
- **Numerics are monospace and aligned** — use `MonoCell`.
- **Charts are honest** — real axes, units, dashed baseline; show `NotEnoughData`
  below the data threshold rather than a misleading 0/100%.
- **Guardrails are always visible** — wherever cost/iterations appear, show the
  ceiling alongside via `GuardrailMeter`; name the bound when it trips.

## Restraint
Generous spacing, hairline borders, minimal ornament. A small Roomba-Blue dot
(`LiveDot`) = live/active. Use `<RoombaLogo />` / `<RoombaLockup />`; don't recolor,
rotate, or close the loop's gap.
