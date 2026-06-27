"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: unknown };

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const [api, setApi] = useState<ApiState>({ status: "idle" });

  // Protect the route: redirect to sign-in once we know there's no session.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [isPending, session, router]);


  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    void (async () => {
      setApi({ status: "loading" });
      try {
        const res = await apiFetch("/api/me");
        if (!res.ok) {
          throw new Error(`Backend responded ${res.status} ${res.statusText}`);
        }
        const data: unknown = await res.json();
        if (!cancelled) setApi({ status: "success", data });
      } catch (err: unknown) {
        if (!cancelled) {
          setApi({
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isPending || !session) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button
          variant="outline"
          onClick={() =>
            authClient.signOut().then(() => router.replace("/"))
          }
        >
          Sign out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neon Auth user</CardTitle>
          <CardDescription>
            The signed-in user from the Neon Auth session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
            {JSON.stringify(session.user, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backend GET /api/me</CardTitle>
          <CardDescription>
            Fetched from the Rails backend with the Neon Auth JWT as a bearer
            token — proves the end-to-end round-trip.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {api.status === "loading" || api.status === "idle" ? (
            <p className="text-muted-foreground">Calling backend…</p>
          ) : api.status === "error" ? (
            <p className="text-destructive">Error: {api.message}</p>
          ) : (
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(api.data, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
