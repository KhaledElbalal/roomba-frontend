import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// Reads request-time cookies + runtime secrets, so it is always dynamic. The
// directive also keeps `next build` from invoking this handler (and reading the
// runtime env, which is injected by App Runner) during prerendering.
export const dynamic = "force-dynamic";

const enc = new TextEncoder();

function requireEnv(name: string): Uint8Array {
  const val = process.env[name];
  if (!val) throw new Error(`${name} environment variable is not set`);
  return enc.encode(val);
}

export async function GET() {
  // Read secrets at request time, not module load — see note above.
  const cookieSecret = requireEnv("NEON_AUTH_COOKIE_SECRET");
  const bridgeSecret = requireEnv("NEON_AUTH_BRIDGE_SECRET");

  const cookieStore = await cookies();
  const sessionDataCookie = cookieStore
    .getAll()
    .find((c) => c.name.endsWith(".session_data"))?.value;

  if (!sessionDataCookie) {
    return new NextResponse(null, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(sessionDataCookie, cookieSecret, {
      algorithms: ["HS256"],
    });

    const userId = payload.sub as string | undefined;
    if (!userId) {
      return new NextResponse(null, { status: 401 });
    }

    const token = await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(bridgeSecret);

    return NextResponse.json({ token });
  } catch {
    return new NextResponse(null, { status: 401 });
  }
}
