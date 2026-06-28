"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Where unauthenticated users are sent. Matches the `[pathname]` auth route. */
const SIGN_IN_PATH = "/auth/sign-in";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export async function getBearerToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiresAt - 30_000) return cachedToken;
  try {
    const res = await fetch("/api/token", { credentials: "same-origin" });
    if (!res.ok) { cachedToken = null; tokenExpiresAt = 0; return null; }
    const data = (await res.json()) as { token?: string };
    cachedToken = data.token ?? null;
    tokenExpiresAt = cachedToken ? jwtExpiry(cachedToken) : 0;
    return cachedToken;
  } catch {
    cachedToken = null;
    tokenExpiresAt = 0;
    return null;
  }
}

/** Drop the cached bearer so the next call re-mints one from the session. */
function clearToken(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

let redirecting = false;

/**
 * The one user-facing contract of this layer: an auth failure (missing/expired
 * JWT) must land the user on sign-in rather than a broken page. Guarded so a
 * burst of failing requests only triggers a single navigation.
 */
export function redirectToSignIn(): void {
  if (typeof window === "undefined" || redirecting) return;
  if (window.location.pathname.startsWith(SIGN_IN_PATH)) return;
  redirecting = true;
  window.location.assign(SIGN_IN_PATH);
}

/** Shape of the JSON error bodies the Rails API renders. */
interface ApiErrorBody {
  error?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

/**
 * Thrown for any non-2xx response. Carries the HTTP status, the backend's
 * `error` code/message, and per-field validation errors when the API renders a
 * 422 with an `errors` map.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly fieldErrors: Record<string, string[]> | null;
  readonly body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    const code = typeof body?.error === "string" ? body.error : null;
    super(code ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = body?.errors ?? null;
    this.body = body;
  }

  get isAuthError(): boolean {
    return this.status === 401;
  }
}

async function parseJson(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return undefined;
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

/** Low-level fetch: attaches auth + JSON headers, resolves the absolute URL. */
export async function apiFetchRaw(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getBearerToken();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = new URL(path, API_URL).toString();
  return fetch(url, { ...init, headers });
}

/**
 * Typed API call. Returns the parsed JSON body on 2xx and throws `ApiError` on
 * any non-2xx (surfacing the Rails error body). On 401 it also clears the
 * cached token and redirects to sign-in before throwing.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await apiFetchRaw(path, init);

  if (!res.ok) {
    const body = (await parseJson(res)) as ApiErrorBody | undefined;
    if (res.status === 401) {
      clearToken();
      redirectToSignIn();
    }
    throw new ApiError(res.status, body ?? null);
  }

  return (await parseJson(res)) as T;
}
