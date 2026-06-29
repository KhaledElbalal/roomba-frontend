# Roomba — Brand Assets

Autonomous agents that close the loop — from a Linear issue to an isolated container.

## The mark

A single near-closed ring — the autonomous run cycle. The node is an agent docking
into a fresh, isolated container at the one point the loop stays open. It never quite
closes, because there's always another issue in the queue.

- **ring** = the loop / the work cycle
- **node** = an agent + its container
- **gap** = the open task, ready to pick up

## Files

```
assets/
├─ svg/
│  ├─ roomba-symbol.svg            loop mark, blue, transparent
│  ├─ roomba-symbol-white.svg      loop mark, white (for color/photo backgrounds)
│  ├─ roomba-app-icon.svg          blue rounded tile + white loop
│  ├─ roomba-lockup.svg            symbol + wordmark, for dark backgrounds
│  ├─ roomba-lockup-light.svg      symbol + wordmark, for light backgrounds
│  └─ roomba-wordmark.svg          "roomba" wordmark only
├─ png/
│  ├─ roomba-symbol-1024.png       transparent
│  ├─ roomba-symbol-256.png        transparent
│  ├─ roomba-symbol-white-1024.png transparent
│  ├─ roomba-app-icon-1024.png
│  ├─ roomba-app-icon-512.png
│  └─ roomba-lockup-dark.png
├─ favicon/
│  ├─ favicon.svg
│  ├─ favicon-32.png
│  ├─ favicon-16.png
│  └─ apple-touch-icon-180.png
└─ social/
   └─ roomba-og-1200x630.png       Open Graph / social share image
```

> SVG wordmark/lockup files reference **Space Grotesk** via an `@import`. Have the font
> installed (or keep a network connection) for accurate rendering, or use the PNGs.

## Color

| Name        | Hex       | Role               |
|-------------|-----------|--------------------|
| Void        | `#070A10` | Background         |
| Ink         | `#0B0F18` | Surface            |
| Slate       | `#1B2230` | Borders            |
| Roomba Blue | `#4C8DFF` | Primary            |
| Signal      | `#9BC2FF` | Accent / node      |
| Deep        | `#1E4FD1` | Pressed / links    |
| Paper       | `#E7ECF6` | Text / light mode  |

App-icon tile gradient: `#2E63E6 → #16307A` (top → bottom).

## Typography

- **Space Grotesk** — display & UI (wordmark uses weight 600, letter-spacing -0.035em)
- **JetBrains Mono** — code, metadata, labels (uppercase, letter-spacing ~0.16em)

## Usage

- **Clearspace** — keep margin equal to the height of the node on all sides.
- **Minimum size** — 24px for the symbol, 96px for the full lockup. Below that, drop
  the wordmark and use the symbol alone.
- Set the wordmark lowercase: **roomba**.
- Don't recolor the mark outside the palette, rotate it, or close the gap.

## Web embed

```html
<link rel="icon" href="/assets/favicon/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon-180.png">
<meta property="og:image" content="/assets/social/roomba-og-1200x630.png">
```

The editable source — full logo system, color, type, and usage — lives in
`Roomba Brand Sheet.dc.html`.
