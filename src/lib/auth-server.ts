import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Server-side Neon Auth instance.
 *
 * All server-side auth wiring lives behind this module (per the integration
 * contract). It is created from `createNeonAuth` and exposes:
 *   - `auth.handler()`  -> the `{ GET, POST, ... }` route handlers mounted at
 *                          `/api/auth/[...all]`, which proxy to Neon Auth.
 *   - `auth.middleware()` -> Next.js middleware to protect routes / refresh sessions.
 *   - Better Auth server methods (`auth.getSession()`, etc).
 *
 * Confirmed against the installed package (@neondatabase/auth@0.4.2-beta):
 *   `createNeonAuth({ baseUrl, cookies: { secret } })`.
 *
 * Env vars (server-side only, never exposed to the browser):
 *   - NEON_AUTH_BASE_URL      Base URL of the hosted Neon Auth instance.
 *   - NEON_AUTH_COOKIE_SECRET Secret for signing session cookies (min 32 chars).
 *
 * Both are read from env, never hardcoded. Confirm exact values from the Neon Console.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
