/**
 * Centralized TanStack Query key conventions.
 *
 * Every query/mutation in the app derives its key from this factory so that
 * cache reads, invalidations, and prefetches stay consistent across tickets.
 *
 * Conventions
 * -----------
 *   - Collections are `[resource, filters]`           e.g. ['runs', { status }]
 *   - Single entities are `[singular, id]`            e.g. ['run', 42]
 *   - Sub-resources nest under their parent entity    e.g. ['run', 42, 'artifacts']
 *   - Derived/parameterized reads append their params e.g. ['metrics', 'cost', '30d', 'model']
 *   - Always spread a factory result; never hand-write a key array at a call
 *     site, so invalidating `queryKeys.runs.all` reliably matches every list.
 */

import type {
  CostGroupBy,
  MetricsRange,
  RunStatus,
  TimeseriesInterval,
  TimeseriesMetric,
} from "./types";

export interface RunFilters {
  status?: RunStatus;
  repo?: string;
  page?: number;
}

export const queryKeys = {
  me: ["me"] as const,

  runs: {
    all: ["runs"] as const,
    list: (filters: RunFilters = {}) => ["runs", filters] as const,
    detail: (id: number) => ["run", id] as const,
    artifacts: (runId: number) => ["run", runId, "artifacts"] as const,
  },

  integrations: ["integrations"] as const,

  llmProviders: ["llm-providers"] as const,

  linearIssues: ["linear-issues"] as const,

  githubRepos: ["github-repos"] as const,

  metrics: {
    all: ["metrics"] as const,
    dora: (range: MetricsRange) => ["metrics", "dora", range] as const,
    usage: (range: MetricsRange) => ["metrics", "usage", range] as const,
    cost: (range: MetricsRange, groupBy?: CostGroupBy) =>
      ["metrics", "cost", range, groupBy ?? null] as const,
    timeseries: (
      range: MetricsRange,
      metric: TimeseriesMetric,
      interval: TimeseriesInterval,
    ) => ["metrics", "timeseries", range, metric, interval] as const,
  },
} as const;
