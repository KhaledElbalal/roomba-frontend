"use client";

import { Layers } from "lucide-react";

import { useLlmProviders } from "@/lib/llm-providers";
import {
  AddLlmProviderCard,
  LlmProviderCard,
} from "@/components/providers/llm-provider-card";

export default function ProvidersPage() {
  const query = useLlmProviders();

  return (
    <div className="mx-auto flex w-full max-w-240 flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Configure the LLM providers Roomba uses for agent runs. API keys are
        stored encrypted and never re-displayed after saving.
      </p>

      {query.isError ? (
        <p className="text-destructive text-sm">
          Couldn't load providers: {query.error.message}
        </p>
      ) : (
        <>
          {query.isPending ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : query.data.length === 0 ? (
            <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center">
              <div className="text-muted-foreground">
                <Layers className="size-8" aria-hidden />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">No providers configured</h3>
                <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                  Add an LLM provider below to enable run triggering.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {query.data.map((provider) => (
                <LlmProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}

          <AddLlmProviderCard />
        </>
      )}
    </div>
  );
}
