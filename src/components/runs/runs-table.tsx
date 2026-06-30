"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import type { RunListItem } from "@/lib/types";
import { durationSeconds, formatDateTime, formatDuration, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MonoCell } from "@/components/instrument/mono-cell";
import { StatusBadge } from "@/components/instrument/status-badge";

const COLUMNS = [
  { key: "status", label: "Status", align: "left" },
  { key: "issue", label: "Issue", align: "left" },
  { key: "repo", label: "Repo", align: "left" },
  { key: "started", label: "Started", align: "right" },
  { key: "duration", label: "Duration", align: "right" },
  { key: "cost", label: "Cost", align: "right" },
  { key: "pr", label: "PR", align: "right" },
] as const;

const HEAD_CLASS =
  "px-4 py-2.5 font-mono text-[10.5px] font-normal tracking-[0.16em] text-muted-foreground uppercase";

export function RunsTable({ runs }: { runs: RunListItem[] }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-border border-b">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  HEAD_CLASS,
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RunRow({ run }: { run: RunListItem }) {
  const href = `/runs/${run.id}`;

  return (
    <tr className="group border-border hover:bg-foreground/3 focus-within:bg-foreground/3 relative cursor-pointer border-b transition-colors last:border-b-0">
      <td className="px-4 py-3">
        {/* Row-spanning overlay link: the whole row navigates to the detail,
            while the PR anchor layers above it (z-10) as an independent target.
            Keeps the row clickable without nesting an interactive in a link. */}
        <Link
          href={href}
          aria-label={`Open run ${run.id}`}
          className="focus-visible:ring-ring/50 absolute inset-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-inset"
        />
        <StatusBadge status={run.status} />
      </td>

      <td className="max-w-[22rem] px-4 py-3">
        {run.linear_task ? (
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="text-muted-foreground shrink-0 font-mono text-xs">
              {run.linear_task.code}
            </span>
            <span className="text-foreground truncate">
              {run.linear_task.name}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        {run.github_repo ? (
          <span className="text-muted-foreground font-mono text-xs">
            {run.github_repo}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-right">
        <MonoCell className="text-muted-foreground text-xs">
          {formatDateTime(run.started_at)}
        </MonoCell>
      </td>

      <td className="px-4 py-3 text-right">
        <MonoCell className="text-muted-foreground text-xs">
          {formatDuration(durationSeconds(run.started_at, run.finished_at))}
        </MonoCell>
      </td>

      <td className="px-4 py-3 text-right">
        <MonoCell signal className="text-xs">
          {formatUsd(run.cost_usd)}
        </MonoCell>
      </td>

      <td className="px-4 py-3 text-right">
        {run.github_pr_url ? (
          <a
            href={run.github_pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground relative z-10 inline-flex items-center gap-1 font-mono text-xs"
          >
            PR
            <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
