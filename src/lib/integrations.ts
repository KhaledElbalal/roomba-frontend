"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch } from "./api";
import { queryKeys } from "./query-keys";
import type { IntegrationProvider, IntegrationStatus } from "./types";

/**
 * Connected/disconnected state for every provider, keyed by `queryKeys.integrations`.
 *
 * The list only contains providers the user has connected, so consumers derive a
 * provider's status with `list.some((i) => i.provider === provider)`.
 */
export function useIntegrations(
  options: { enabled?: boolean } = {},
): UseQueryResult<IntegrationStatus[]> {
  return useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => apiFetch<IntegrationStatus[]>("/api/integrations"),
    enabled: options.enabled ?? true,
  });
}

export interface ConnectIntegrationVars {
  provider: IntegrationProvider;
  token: string;
}

/** Local rollback context shared by the optimistic connect/disconnect mutations. */
interface IntegrationsSnapshot {
  previous: IntegrationStatus[] | undefined;
}

function upsertConnected(
  list: IntegrationStatus[] | undefined,
  provider: IntegrationProvider,
): IntegrationStatus[] {
  const current = list ?? [];
  if (current.some((i) => i.provider === provider)) {
    return current.map((i) =>
      i.provider === provider ? { ...i, connected: true } : i,
    );
  }
  return [...current, { provider, connected: true }];
}

/**
 * Connect a provider by POSTing a PAT. The backend validates the token against
 * the provider before persisting, so a bad/under-scoped token comes back as a
 * 422 (surfaced as an `ApiError` for the caller to render inline).
 *
 * Optimistically marks the provider connected and rolls back on failure; always
 * invalidates `['integrations']` on settle so the cache reflects the server.
 */
export function useConnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation<
    IntegrationStatus,
    Error,
    ConnectIntegrationVars,
    IntegrationsSnapshot
  >({
    mutationFn: ({ provider, token }) =>
      apiFetch<IntegrationStatus>("/api/integrations", {
        method: "POST",
        body: JSON.stringify({ provider, token }),
      }),
    onMutate: async ({ provider }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.integrations });
      const previous = queryClient.getQueryData<IntegrationStatus[]>(
        queryKeys.integrations,
      );
      queryClient.setQueryData<IntegrationStatus[]>(queryKeys.integrations, (old) =>
        upsertConnected(old, provider),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.integrations, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations });
    },
  });
}

/**
 * Disconnect a provider. Optimistically drops it from the list and rolls back on
 * failure; the 204 response carries no body.
 */
export function useDisconnectIntegration() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, IntegrationProvider, IntegrationsSnapshot>({
    mutationFn: (provider) =>
      apiFetch<void>(`/api/integrations/${provider}`, { method: "DELETE" }),
    onMutate: async (provider) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.integrations });
      const previous = queryClient.getQueryData<IntegrationStatus[]>(
        queryKeys.integrations,
      );
      queryClient.setQueryData<IntegrationStatus[]>(queryKeys.integrations, (old) =>
        (old ?? []).filter((i) => i.provider !== provider),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.integrations, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations });
    },
  });
}
