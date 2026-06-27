import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} environment variable is not set`);
  return val;
}

// Lazily constructed so that `next build` (which imports this module while
// collecting page data) does not require the runtime auth env vars. They are
// only present at request time, injected by App Runner — never baked into the
// image. The instance is memoised after the first request.
let instance: ReturnType<typeof createNeonAuth> | undefined;

export function getAuth() {
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: requireEnv("NEON_AUTH_BASE_URL"),
      cookies: {
        secret: requireEnv("NEON_AUTH_COOKIE_SECRET"),
      },
    });
  }
  return instance;
}
