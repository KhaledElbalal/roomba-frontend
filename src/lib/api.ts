"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getBearerToken();

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = new URL(path, API_URL).toString();

  return fetch(url, { ...init, headers });
}
