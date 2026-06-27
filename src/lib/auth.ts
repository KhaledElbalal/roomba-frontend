"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Client-side Neon Auth client.
 *
 * All client-side auth wiring lives behind this module (per the integration
 * contract). The Next.js `createAuthClient()` (from `@neondatabase/auth/next`)
 * returns a Better Auth React client that talks to the local `/api/auth/[...all]`
 * route (mounted by `auth.handler()` in `auth-server.ts`), which in turn proxies
 * to the hosted Neon Auth instance.
 *
 * Confirmed against the installed package (@neondatabase/auth@0.4.2-beta) — the
 * returned client exposes (among others):
 *   - `authClient.useSession()` -> React hook: `{ data: { user, session }, isPending, ... }`
 *   - `authClient.token()`      -> `Promise<{ data: { token } | null, error }>`
 *                                  the session JWT (Better Auth `jwtClient` plugin),
 *                                  used as the bearer for backend calls.
 *   - `authClient.signOut()`
 *
 * No public URLs/secrets are needed here: the client defaults its baseURL to the
 * current origin and basePath `/api/auth`, which the server handler proxies.
 */
export const authClient = createAuthClient();
