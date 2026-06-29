"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch } from "./api";
import { queryKeys } from "./query-keys";
import type { LlmProvider } from "./types";

export function useLlmProviders(
  options: { enabled?: boolean } = {},
): UseQueryResult<LlmProvider[]> {
  return useQuery({
    queryKey: queryKeys.llmProviders,
    queryFn: () => apiFetch<LlmProvider[]>("/api/llm_providers"),
    enabled: options.enabled ?? true,
  });
}

export interface CreateLlmProviderVars {
  provider_name: string;
  base_url: string | null;
  available_models: string[];
  api_key: string;
}

export interface UpdateLlmProviderVars {
  id: number;
  provider_name: string;
  base_url: string | null;
  available_models: string[];
  api_key?: string;
}

export function useCreateLlmProvider() {
  const queryClient = useQueryClient();

  return useMutation<LlmProvider, Error, CreateLlmProviderVars>({
    mutationFn: (vars) =>
      apiFetch<LlmProvider>("/api/llm_providers", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.llmProviders });
    },
  });
}

export function useUpdateLlmProvider() {
  const queryClient = useQueryClient();

  return useMutation<LlmProvider, Error, UpdateLlmProviderVars>({
    mutationFn: ({ id, ...rest }) =>
      apiFetch<LlmProvider>(`/api/llm_providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(rest),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.llmProviders });
    },
  });
}

export function useDeleteLlmProvider() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/llm_providers/${id}`, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.llmProviders });
    },
  });
}
