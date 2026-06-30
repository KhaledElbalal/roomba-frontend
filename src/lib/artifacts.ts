import { formatDuration, formatUsd } from "./format";
import type { Artifact, LlmCallPayload, RunDetail, RunStatus } from "./types";

const ACTIVE_STATUSES: ReadonlySet<RunStatus> = new Set(["queued", "running"]);

export function isActiveStatus(status: RunStatus): boolean {
  return ACTIVE_STATUSES.has(status);
}

/**
 * The `llm_call` payload as a validated, normalized `LlmCallPayload`, or null for
 * any other type or a malformed payload. Payloads are loosely typed JSON, so a
 * call missing its tokens/cost would otherwise feed `NaN` into the live cost and
 * token totals — validate the numeric spine here and degrade to null instead.
 */
export function llmPayload(artifact: Artifact): LlmCallPayload | null {
  if (artifact.artifact_type !== "llm_call" || !artifact.payload) return null;
  const p = artifact.payload as Record<string, unknown>;

  const input = Number(p.input_tokens);
  const output = Number(p.output_tokens);
  // cost_usd serializes as a decimal string, but tolerate a raw number too.
  const cost = Number(p.cost_usd);
  if (!Number.isFinite(input) || !Number.isFinite(output) || !Number.isFinite(cost)) {
    return null;
  }

  return {
    provider: typeof p.provider === "string" ? p.provider : "—",
    model: typeof p.model === "string" ? p.model : "—",
    input_tokens: input,
    output_tokens: output,
    cost_usd: String(p.cost_usd),
    fallback: p.fallback === true,
  };
}

export function liveCostUsd(artifacts: Artifact[]): number {
  return artifacts.reduce((sum, a) => {
    const p = llmPayload(a);
    return p ? sum + (Number.parseFloat(p.cost_usd) || 0) : sum;
  }, 0);
}

export function liveTokens(artifacts: Artifact[]): number {
  return artifacts.reduce((sum, a) => {
    const p = llmPayload(a);
    return p ? sum + p.input_tokens + p.output_tokens : sum;
  }, 0);
}

export function llmCallCount(artifacts: Artifact[]): number {
  return artifacts.reduce((n, a) => (a.artifact_type === "llm_call" ? n + 1 : n), 0);
}

export function fallbackCall(artifacts: Artifact[]): LlmCallPayload | null {
  for (const a of artifacts) {
    const p = llmPayload(a);
    if (p?.fallback) return p;
  }
  return null;
}

export function effectiveCostUsd(run: RunDetail): number {
  if (run.cost_usd != null) return Number.parseFloat(run.cost_usd) || 0;
  return liveCostUsd(run.artifacts);
}

export function effectiveTokens(run: RunDetail): number {
  return run.tokens_used ?? liveTokens(run.artifacts);
}

/**
 * Human bound-that-tripped for the terminal node of a failed/timed-out run. The
 * three guardrail reasons name the ceiling they hit; other reasons (failed tests,
 * no diff, an aborting error) are already human-readable, so pass them through.
 */
export function failureLabel(run: RunDetail): string {
  switch (run.failure_reason) {
    case "max_cost_usd":
      return `hit max cost ${formatUsd(run.max_cost_usd)}`;
    case "max_iterations":
      return `hit max iterations (${run.max_iterations ?? "—"})`;
    case "max_wall_clock_seconds":
      return `hit wall-clock limit (${formatDuration(run.max_wall_clock_seconds)})`;
    default:
      if (run.failure_reason) return run.failure_reason;
      return run.status === "timed_out" ? "run timed out" : "run failed";
  }
}
