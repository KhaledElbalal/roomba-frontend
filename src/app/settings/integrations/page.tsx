"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth";
import { useIntegrations } from "@/lib/integrations";
import type { IntegrationProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  IntegrationCard,
  PROVIDERS,
} from "@/components/integrations/integration-card";

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;

  // Protect the route: redirect to sign-in once we know there's no session.
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/sign-in");
    }
  }, [isPending, session, router]);

  const integrationsQuery = useIntegrations({ enabled: Boolean(userId) });

  if (isPending || !session) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const connectedProviders = new Set<IntegrationProvider>(
    (integrationsQuery.data ?? [])
      .filter((i) => i.connected)
      .map((i) => i.provider),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Connect GitHub and Linear so Roomba can act on your behalf.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </div>

      {integrationsQuery.isError ? (
        <p className="text-destructive">
          Couldn’t load integrations: {integrationsQuery.error.message}
        </p>
      ) : integrationsQuery.isPending ? (
        <p className="text-muted-foreground">Loading integrations…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {PROVIDERS.map((config) => (
            <IntegrationCard
              key={config.provider}
              config={config}
              connected={connectedProviders.has(config.provider)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
