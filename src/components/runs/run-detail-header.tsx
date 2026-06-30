"use client";

import { ExternalLink, GitBranch, GitPullRequest } from "lucide-react";

import type { RunDetail } from "@/lib/types";
import {
  effectiveCostUsd,
  effectiveTokens,
  fallbackCall,
  isActiveStatus,
  llmCallCount,
} from "@/lib/artifacts";
import {
  durationSeconds,
  formatDuration,
  formatInt,
  formatUsd,
} from "@/lib/format";
import { Button } from "@/components/ui/button";
import { GuardrailMeter } from "@/components/instrument/guardrail-meter";
import { StatTile } from "@/components/instrument/stat-tile";
import { StatusBadge } from "@/components/instrument/status-badge";

export function RunDetailHeader({ run }: { run: RunDetail }) {
  const running = isActiveStatus(run.status);
  const cost = effectiveCostUsd(run);
  const tokens = effectiveTokens(run);
  const iterations = llmCallCount(run.artifacts);
  const fallback = fallbackCall(run.artifacts);

  const costCeiling = run.max_cost_usd
    ? Number.parseFloat(run.max_cost_usd) || 0
    : 0;
  const iterCeiling = run.max_iterations ?? 0;
  const hasGuardrails = costCeiling > 0 || iterCeiling > 0;

  return (
    <header className="border-border bg-card flex flex-col gap-6 rounded-xl border p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-3">
            <StatusBadge status={run.status} />
            {run.linear_task && (
              <span className="text-muted-foreground font-mono text-xs">
                {run.linear_task.code}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            {run.linear_task?.name ?? run.name ?? `Run #${run.id}`}
          </h2>
          {run.github_repo && (
            <div className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
              <GitBranch className="size-3.5" aria-hidden />
              {run.github_repo}
            </div>
          )}
        </div>

        {run.github_pr_url && (
          <Button asChild variant="outline" size="sm">
            <a
              href={run.github_pr_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitPullRequest aria-hidden />
              View PR
              <ExternalLink aria-hidden />
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <StatTile
          label="provider"
          value={run.llm_provider?.provider_name ?? "—"}
          hint={
            fallback ? (
              <span className="text-signal">fell back to {fallback.model}</span>
            ) : undefined
          }
        />
        <StatTile label="total cost" value={formatUsd(cost)} signal />
        <StatTile
          label="duration"
          value={formatDuration(
            durationSeconds(run.started_at, run.finished_at),
          )}
          hint={running ? "elapsed" : undefined}
        />
        <StatTile label="tokens" value={formatInt(tokens)} />
      </div>

      {hasGuardrails && (
        <div className="border-border grid gap-5 border-t pt-5 sm:grid-cols-2">
          {costCeiling > 0 && (
            <GuardrailMeter
              label="spend"
              current={cost}
              ceiling={costCeiling}
              format={(n) => formatUsd(n)}
            />
          )}
          {iterCeiling > 0 && (
            <GuardrailMeter
              label="iterations"
              current={iterations}
              ceiling={iterCeiling}
              format={(n) => String(Math.round(n))}
            />
          )}
        </div>
      )}
    </header>
  );
}
