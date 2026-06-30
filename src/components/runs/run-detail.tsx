"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useRun } from "@/lib/runs";
import { RouteEmptyState } from "@/components/instrument/route-empty-state";
import { RunDetailHeader } from "./run-detail-header";
import { ArtifactTimeline } from "./artifact-timeline";

export function RunDetail({ id }: { id: number }) {
  const runQuery = useRun(id);

  if (runQuery.isPending) {
    return <p className="text-muted-foreground text-sm">Loading run…</p>;
  }

  if (runQuery.isError) {
    const err = runQuery.error;
    // A 404 is "this run isn't yours / doesn't exist" — route back, don't dead-end.
    if (err instanceof ApiError && err.status === 404) {
      return (
        <div className="mx-auto w-full max-w-275">
          <RouteEmptyState
            title="Run not found"
            description="This run doesn’t exist or belongs to another account."
            actionHref="/runs"
            actionLabel="Back to runs"
            icon={<SearchX className="size-8" aria-hidden />}
          />
        </div>
      );
    }
    return (
      <p className="text-destructive text-sm">
        Couldn’t load run: {err.message}
      </p>
    );
  }

  const run = runQuery.data;

  return (
    <div className="mx-auto flex w-full max-w-275 flex-col gap-6">
      <Link
        href="/runs"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 font-mono text-xs"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Runs
      </Link>

      <RunDetailHeader run={run} />
      <ArtifactTimeline run={run} />
    </div>
  );
}
