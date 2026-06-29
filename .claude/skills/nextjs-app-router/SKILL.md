---
name: nextjs-app-router
description: Best practices for this Next.js 16 App Router project (React 19, Server Components, Tailwind v4, TanStack Query). Use when creating or editing pages, layouts, route handlers, components, data fetching, metadata, or anything under src/app or src/components.
when_to_use: Triggers on work involving Server vs Client Components, 'use client', async params/searchParams, data fetching, caching/revalidation, Suspense/streaming, loading.tsx/error.tsx, route handlers, metadata, next/font, next/image, or TanStack Query setup.
paths: src/app/**, src/components/**, src/lib/**, next.config.ts
---

# Next.js 16 App Router conventions

This is **Next.js 16** (App Router, React 19, Turbopack). APIs differ from pre-16.
Ground truth lives in `node_modules/next/dist/docs/01-app/` — read it before guessing an API.

## Server vs Client Components
- Components are **Server Components by default**. Add `'use client'` ONLY for: state/effects, event handlers (`onClick`/`onChange`), browser APIs (`window`, `localStorage`), or custom hooks.
- Do: push `'use client'` to the smallest leaf (e.g. a `<Search />`), keep layouts/pages as Server Components.
- Don't: put `'use client'` at the top of a layout/page or a large subtree — everything it imports ships to the client bundle.
- To nest server UI inside a client component, pass it as `children`/props (a server component passed as a prop is NOT pulled into the client graph).
- React Context only works in Client Components: make a client `Provider` that takes `children`, render it in the Server layout, and put it as deep as possible.

## Data fetching (Server Components)
- Fetch in Server Components with `await fetch(...)` or a direct DB/ORM call. Secrets stay server-side.
- `fetch` is **NOT cached by default** in Next 16 and blocks render until it resolves.
- Parallelize independent requests: kick off the promises, then `await Promise.all([...])`. Avoid accidental sequential awaits.
- Dedupe per-request work with `React.cache(...)` (scoped to one request).
- Mark server-only modules with `import 'server-only'` (already a dependency). Only `NEXT_PUBLIC_`-prefixed env vars reach the client.

## Async params / searchParams (Next 16 — important)
- `params` and `searchParams` are **Promises**. Always `await` them:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- Same for `generateMetadata({ params, searchParams })` — await before use.

## Caching & revalidation
- `cacheComponents` is **NOT enabled** in this repo's `next.config.ts`, so `use cache` / `cacheLife` / `cacheTag` are unavailable. Don't write them unless you first set `cacheComponents: true`.
- Current (legacy) model: use `React.cache` for per-request dedupe; opt into route caching with route segment config or `next: { revalidate }` on `fetch`. See `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.
- IF you enable `cacheComponents: true` later: this turns on Cache Components + Partial Prerendering. Then `use cache` + `cacheLife('hours')` + `cacheTag('x')` cache data/UI, `updateTag('x')` invalidates, and any uncached/runtime data (`cookies()`, `headers()`, `searchParams`, DB reads) MUST be wrapped in `<Suspense>` or build fails with "Uncached data was accessed outside of <Suspense>". Read runtime values OUTSIDE a cached scope and pass them in as args. Call `connection()` before `Math.random()`/`Date.now()`/`crypto.randomUUID()`.

## Streaming, loading & errors
- Add `loading.tsx` in a route folder to stream the whole segment (auto-wraps page in `<Suspense>`).
- Use `<Suspense fallback={...}>` around slow/dynamic sub-trees for granular streaming; show meaningful skeletons.
- Caveat: a layout that reads runtime data (`cookies()`, uncached fetch) does NOT fall back to same-segment `loading.tsx` — wrap that access in its own `<Suspense>` or move fetching into the page.
- Add `error.tsx` (Client Component) for uncaught exceptions; for expected errors return values from Server Functions and surface via `useActionState`, don't throw.

## Route Handlers (`src/app/.../route.ts`)
- Web `Request`/`Response`; or `NextRequest`/`NextResponse` for helpers. No `route.ts` and `page.tsx` in the same segment.
- Not cached by default; opt in a `GET` with `export const dynamic = 'force-static'`. Non-GET is never cached.
- Type context with the global helper: `ctx: RouteContext<'/users/[id]'>`, then `const { id } = await ctx.params`.

## Metadata
- Export a static `metadata: Metadata` object, or async `generateMetadata` for data-driven tags. Server Components only.

## Fonts & images
- `next/font` (Google or local) self-hosts and avoids layout shift; load in root layout and apply via `className`. Prefer variable fonts.
- `next/image` (`<Image>`) for all raster images: set `width`/`height` (or `fill`) to prevent CLS; use `priority` only for above-the-fold/LCP images. Configure remote hosts in `next.config.ts` (`images.remotePatterns`).

## TanStack Query + RSC (this project uses @tanstack/react-query v5)
- The `QueryClient` lives in a Client Component provider (`src/components/query-provider.tsx`). Create it lazily (`useState(() => new QueryClient(...))`) so it's stable per browser tab.
- Set `defaultOptions.queries.staleTime` above 0 (e.g. `60_000`) so prefetched/SSR data isn't refetched immediately on mount.
- To prefetch on the server: make a **new** `QueryClient` per request in a Server Component, `await queryClient.prefetchQuery({...})`, then render `<HydrationBoundary state={dehydrate(queryClient)}>` around the client subtree. Never reuse one server `QueryClient` across requests.
- Keep query keys centralized in `src/lib/query-keys.ts`.

## Quick do/don't
- Do read `node_modules/next/dist/docs/` for any Next API before writing it.
- Do keep server/client boundaries tight and `'use client'` minimal.
- Don't `await` `params`/`searchParams` synchronously or treat them as plain objects.
- Don't add `use cache`/`cacheLife` while `cacheComponents` is off.
- Don't import server-only modules (DB clients, secrets) into Client Components.
