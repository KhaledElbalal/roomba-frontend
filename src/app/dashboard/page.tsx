"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { MeResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;

  // Protect the route: redirect to sign-in once we know there's no session.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [isPending, session, router]);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiFetch<MeResponse>("/api/me"),
    enabled: Boolean(userId),
  });

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
          {meQuery.isPending ? (
            <p className="text-muted-foreground">Calling backend…</p>
          ) : meQuery.isError ? (
            <p className="text-destructive">Error: {meQuery.error.message}</p>
          ) : (
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(meQuery.data, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
