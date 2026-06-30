"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiFetch, ApiError } from "./api";
import { queryKeys, type RunFilters } from "./query-keys";
import type {
  GithubRepo,
  LinearTask,
  Paginated,
  Run,
  RunDetail,
  RunListItem,
  RunStatus,
} from "./types";

const ACTIVE_STATUSES: ReadonlySet<RunStatus> = new Set(["queued", "running"]);
const POLL_INTERVAL_MS = 2_000;

/**
 * Paginated, filterable run list (`GET /api/runs`).
 *
 * Polling contract (see `src/app/CLAUDE.md`): refetch every ~2s while any
 * visible row is `queued`/`running`, and stop entirely once every row is
 * terminal — so the user watches state advance without manual refresh, and an
 * all-settled page costs nothing. `keepPreviousData` keeps the current page on
 * screen while the next page (or a poll) resolves, avoiding a flash to loading.
 */
export function useRuns(
  filters: RunFilters = {},
): UseQueryResult<Paginated<RunListItem>> {
  return useQuery({
    queryKey: queryKeys.runs.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.repo) params.set("repo", filters.repo);
      if (filters.page && filters.page > 1) {
        params.set("page", String(filters.page));
      }
      const qs = params.toString();
      return apiFetch<Paginated<RunListItem>>(
        `/api/runs${qs ? `?${qs}` : ""}`,
      );
    },
    placeholderData: keepPreviousData,
    refetchInterval: (query) => {
      const rows = query.state.data?.data;
      if (!rows?.length) return false;
      return rows.some((r) => ACTIVE_STATUSES.has(r.status))
        ? POLL_INTERVAL_MS
        : false;
    },
  });
}

/**
 * One run plus its ordered artifact timeline (`GET /api/runs/:id`). The detail
 * endpoint inlines the full, unpaginated artifact stream, so this single query
 * is the live source for both the header and the timeline — no second request to
 * `/artifacts`, which would race the inlined copy while streaming.
 *
 * Same polling contract as the list (see `src/app/CLAUDE.md`): refetch every ~2s
 * while the run is `queued`/`running` so new artifacts append live, and stop the
 * moment it reaches a terminal status.
 */
export function useRun(id: number): UseQueryResult<RunDetail> {
  return useQuery({
    queryKey: queryKeys.runs.detail(id),
    queryFn: () => apiFetch<RunDetail>(`/api/runs/${id}`),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.has(status) ? POLL_INTERVAL_MS : false;
    },
  });
}

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
