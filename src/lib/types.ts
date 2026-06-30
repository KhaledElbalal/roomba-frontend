/**
 * Typed response models for the Roomba backend.
 *
 * These mirror the Rails models / schema (`agent_runs`, `agent_artifacts`,
 * `linear_tasks`, `integrations`, `llm_providers`) and the `Metrics::*` query
 * objects. The dedicated read endpoints for Run/Artifact/Integration/LlmProvider
 * land in ROO-15/18/19; until then these shapes are the contract this client is
 * built against. Field-level notes:
 *
 *   - Timestamps are ISO-8601 strings (Rails default JSON encoding).
 *   - `decimal` columns (`cost_usd`, `max_cost_usd`) serialize as strings.
 *   - `bigint` ids / `tokens_used` serialize as numbers.
 *   - Secret refs (`*_secret_ref`) point at Secrets Manager entries, never the
 *     raw secret; later serializers may omit them entirely.
 */

export type RunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "timed_out";

export interface Run {
  id: number;
  user_id: string;
  name: string | null;
  description: string | null;
  status: RunStatus;

  github_repo: string | null;
  github_pr_url: string | null;
  linear_id: string | null;
  linear_task_id: number | null;

  llm_provider_id: number;
  llm_provider_fallback_id: number | null;

  dockerfile_path: string | null;
  agent_handle: string | null;

  // Bounds (hard stops enforced by the harness).
  max_iterations: number | null;
  max_wall_clock_seconds: number | null;
  max_cost_usd: string | null;

  // Cached terminal totals.
  cost_usd: string | null;
  tokens_used: number | null;

  // Outcome / feedback.
  changes_requested: boolean | null;
  failure_reason: string | null;
  user_rating: number | null;
  user_feedback: string | null;

  // Timestamp spine (drives DORA + usage metrics).
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
  pr_opened_at: string | null;
  deployed_at: string | null;
}

/** Nested provider summary on a serialized run (`RunSerializer#provider_summary`). */
export interface RunProviderSummary {
  id: number;
  provider_name: string;
}

/** Nested Linear task on a serialized run (`LinearTaskSerializer`). */
export interface RunLinearTask {
  id: number;
  code: string;
  name: string;
  description: string | null;
  task_type: LinearTaskType;
  synced_at: string | null;
}

/**
 * A run as the API actually serializes it (`RunSerializer`) — what `/api/runs`
 * and `/api/runs/:id` return. This is NOT the raw `Run` row: secret-bearing and
 * internal id-only columns are dropped, and the provider + Linear task are
 * inlined as nested summaries instead of bare foreign keys.
 */
export interface RunListItem {
  id: number;
  status: RunStatus;
  name: string | null;
  description: string | null;
  github_repo: string | null;
  github_pr_url: string | null;
  started_at: string | null;
  finished_at: string | null;
  deployed_at: string | null;
  pr_opened_at: string | null;
  cost_usd: string | null;
  tokens_used: number | null;
  user_rating: number | null;
  changes_requested: boolean | null;
  user_feedback: string | null;
  failure_reason: string | null;
  max_cost_usd: string | null;
  max_iterations: number | null;
  max_wall_clock_seconds: number | null;
  created_at: string;
  updated_at: string;
  llm_provider: RunProviderSummary | null;
  linear_task: RunLinearTask | null;
}

/** Envelope for paginated list endpoints, e.g. `GET /api/runs`. */
export interface Paginated<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
}

export type ArtifactType =
  | "thinking"
  | "read_file"
  | "edit_file"
  | "run_command"
  | "llm_call";

/** Payload of an `llm_call` artifact (one per model call). */
export interface LlmCallPayload {
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: string;
  fallback: boolean;
}

export type ArtifactPayload =
  | LlmCallPayload
  | Record<string, unknown>
  | null;

export interface Artifact {
  id: number;
  agent_run_id: number;
  artifact_type: ArtifactType;
  sequence: number;
  payload: ArtifactPayload;
  created_at: string;
}

export type LinearTaskType = "feature" | "bugfix";

export interface LinearTask {
  id: number;
  code: string;
  name: string;
  description: string | null;
  task_type: LinearTaskType;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type IntegrationProvider = "github" | "linear";

/**
 * `GET /api/integrations` / `POST /api/integrations` response item.
 *
 * The backend serializer (`IntegrationSerializer`) deliberately exposes only the
 * provider and a connected flag — never the token, its secret ref, or metadata.
 * This is the contract the integrations UI is built against; the fuller
 * `Integration` shape below mirrors the DB row for endpoints that may expose it.
 */
export interface IntegrationStatus {
  provider: IntegrationProvider;
  connected: boolean;
}

export interface Integration {
  id: number;
  user_id: string;
  provider: IntegrationProvider;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface GithubRepo {
  full_name: string;
  name: string;
  private: boolean;
}

export interface LlmProvider {
  id: number;
  provider_name: string;
  base_url: string | null;
  available_models: string[] | null;
}

export type MetricsRange = "7d" | "30d" | "90d" | "month";

/** `Metrics::DoraQuery#call` */
export interface DoraMetrics {
  lead_time_median_seconds: number | null;
  /** Keyed by ISO date (YYYY-MM-DD) -> deployment count. */
  deployment_frequency: Record<string, number>;
  change_failure_rate: number | null;
  mttr_seconds: number | null;
}

/** `Metrics::UsageQuery#call` */
export interface UsageMetrics {
  run_count: number;
  success_rate: number | null;
  queue_wait_median_seconds: number | null;
}

export type CostGroupBy = "model" | "provider";

export interface CostGroup {
  key: string;
  /** Null when grouping by model (spend is not attributable per model yet). */
  spend_usd: number | null;
  tokens: number;
}

/** `Metrics::CostQuery#call` */
export interface CostMetrics {
  total_usd: number;
  total_tokens: number | null;
  by_group: CostGroup[];
  fallback_share: number | null;
}

export type TimeseriesMetric = "run_count" | "cost_usd" | "tokens_used";
export type TimeseriesInterval = "day" | "week";

export interface TimeseriesPoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  value: number;
}

/** `Metrics::TimeseriesQuery#call` */
export interface TimeseriesMetrics {
  metric: TimeseriesMetric;
  interval: TimeseriesInterval;
  points: TimeseriesPoint[];
}

/** `GET /api/me` */
export interface MeResponse {
  user_id: string;
  profile: NeonAuthProfile | null;
}

export interface NeonAuthProfile {
  id: string;
  [key: string]: unknown;
}
