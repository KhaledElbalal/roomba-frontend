---
name: vercel-deploy
description: Vercel deployment and web-performance best practices for this Next.js app (Core Web Vitals, image/font optimization, caching headers, env vars, edge vs node, Speed Insights/Analytics). Use when optimizing performance, configuring env vars, setting cache headers, or preparing for / debugging a Vercel deploy.
when_to_use: Triggers on Core Web Vitals (LCP/INP/CLS), Cache-Control headers, environment variables, edge vs node runtime, @vercel/speed-insights or @vercel/analytics, image/font optimization for production, or pre-launch checks.
paths: next.config.ts, src/app/**, vercel.json, .env*
---

# Vercel + performance best practices

## Core Web Vitals (optimize for field data, not Lighthouse)
- LCP: mark the largest above-the-fold image with `priority` on `<Image>`; preload critical fonts via `next/font`; keep the server response fast (cache where safe).
- CLS: always give `<Image>` explicit `width`/`height` (or `fill` + sized parent); use `next/font` (self-hosted, no layout shift). Reserve space for dynamic content.
- INP: minimize client JS — keep `'use client'` to small interactive leaves; defer/lazy-load non-critical client components (`next/dynamic`).
- Measure real users with `@vercel/speed-insights` before tuning.

## Image & font optimization
- Use `next/image`; on Vercel images are optimized on demand (modern formats, correct sizes). Declare remote hosts in `next.config.ts` `images.remotePatterns`.
- Use `next/font` for self-hosting; prefer variable fonts; subset to needed languages.

## Caching (CDN convention — verify against current Vercel docs)
- Static/marketing pages: static generation + long-lived caching.
- Content that changes periodically: revalidation (ISR-style) rather than always-dynamic.
- For Route Handlers serving cacheable data, a common edge pattern is a `Cache-Control` header like `s-maxage=<n>, stale-while-revalidate=<m>` to serve stale while revalidating. Pick values per endpoint; don't cache user-specific responses.
- Don't cache responses that depend on auth/cookies/headers.

## Environment variables
- Server-only secrets: no prefix (e.g. `DATABASE_URL`). Set per-environment (Production / Preview / Development) in Vercel project settings.
- Client-exposed values MUST be prefixed `NEXT_PUBLIC_` (they ship in the browser bundle — never put secrets here).
- Keep `.env*` files out of git; mirror them in Vercel settings.

## Edge vs Node runtime
- Default to the Node.js runtime for full Node API + DB driver support.
- Use the Edge runtime only for light, latency-sensitive, globally-distributed logic (e.g. simple middleware/redirects) — it has a restricted API surface and no full Node APIs. Don't force Edge for routes that need a Node DB client.

## Observability (optional, opt-in)
- Speed Insights: `npm i @vercel/speed-insights`, then in `src/app/layout.tsx`:
  `import { SpeedInsights } from '@vercel/speed-insights/next'` and render `<SpeedInsights />` inside `<body>`. (`route` is auto-set for Next.) `debug` auto-enables in dev/test.
- Web Analytics: `npm i @vercel/analytics`, render `<Analytics />` from `@vercel/analytics/next` in the root layout.

## Pre-deploy checklist
- `next build` passes locally (Turbopack); no type errors; lint clean (`npm run lint`).
- All required env vars set for the target Vercel environment.
- `<Image>` has dimensions; LCP image has `priority`; remote image hosts whitelisted.
- No secrets behind `NEXT_PUBLIC_`; server-only modules guarded with `import 'server-only'`.
