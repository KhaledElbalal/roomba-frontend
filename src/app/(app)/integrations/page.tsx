"use client";

import { CircleCheck, CircleDashed } from "lucide-react";

import { useIntegrations } from "@/lib/integrations";
import type { IntegrationProvider } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IntegrationCard,
  PROVIDERS,
} from "@/components/integrations/integration-card";

export default function IntegrationsPage() {
  const integrationsQuery = useIntegrations();

  const connected = new Set<IntegrationProvider>(
    (integrationsQuery.data ?? [])
      .filter((i) => i.connected)
      .map((i) => i.provider),
  );
  const allConnected =
    integrationsQuery.isSuccess &&
    PROVIDERS.every((p) => connected.has(p.provider));

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Connect GitHub and Linear so Roomba can pick up issues and open pull
        requests on your behalf.
      </p>

      {integrationsQuery.isError ? (
        <p className="text-destructive text-sm">
          Couldn’t load integrations: {integrationsQuery.error.message}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {PROVIDERS.map((config) => (
            <IntegrationCard
              key={config.provider}
              config={config}
              connected={connected.has(config.provider)}
            />
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs",
          allConnected
            ? "border-primary/30 bg-primary/8 text-foreground"
            : "border-border text-muted-foreground",
        )}
      >
        {allConnected ? (
          <CircleCheck className="text-primary size-4" aria-hidden />
        ) : (
          <CircleDashed className="size-4" aria-hidden />
        )}
        {allConnected
          ? "Run triggering unlocked — both providers connected."
          : "Connect GitHub and Linear to unlock run triggering."}
      </div>
    </div>
  );
}
