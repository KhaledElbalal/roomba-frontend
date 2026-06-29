"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch, ApiError } from "./api";
import { queryKeys } from "./query-keys";
import type { GithubRepo, LinearTask, Run } from "./types";

export function useLinearIssues(): UseQueryResult<LinearTask[]> {
  return useQuery({
    queryKey: queryKeys.linearIssues,
    queryFn: () => apiFetch<LinearTask[]>("/api/linear/issues"),
  });
}

export function useGithubRepos(): UseQueryResult<GithubRepo[]> {
  return useQuery({
    queryKey: queryKeys.githubRepos,
    queryFn: () => apiFetch<GithubRepo[]>("/api/github/repos"),
  });
}

export interface CreateRunVars {
  github_repo: string;
  linear_task_id: number;
  llm_provider_id: number;
  max_iterations?: number;
  max_wall_clock_seconds?: number;
  max_cost_usd?: string;
}

export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation<Run, ApiError, CreateRunVars>({
    mutationFn: (vars) =>
      apiFetch<Run>("/api/runs", {
        method: "POST",
        body: JSON.stringify(vars),
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs.all });
    },
  });
}
