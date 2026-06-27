import { getAuth } from "@/lib/auth-server";

// This route proxies auth requests to Neon Auth using request-time cookies, so
// it can never be statically rendered. Marking it dynamic also stops `next build`
// from invoking the handler (and thus reading runtime env) during prerendering.
export const dynamic = "force-dynamic";

type Handlers = ReturnType<ReturnType<typeof getAuth>["handler"]>;

export function GET(...args: Parameters<Handlers["GET"]>) {
  return getAuth().handler().GET(...args);
}

export function POST(...args: Parameters<Handlers["POST"]>) {
  return getAuth().handler().POST(...args);
}
