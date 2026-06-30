"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react";

import { useRuns } from "@/lib/runs";
import { formatInt } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { RouteEmptyState } from "@/components/instrument/route-empty-state";
import { RunFilters, type RunFilterState } from "@/components/runs/run-filters";
import { RunsTable } from "@/components/runs/runs-table";

export default function RunsPage() {
  const [filters, setFilters] = useState<RunFilterState>({
    status: null,
    repo: null,
  });
  const [page, setPage] = useState(1);

  // Changing a filter resets to the first page — the old page number rarely
  // exists in the narrower result set.
  function applyFilters(next: RunFilterState) {
    setPage(1);
    setFilters(next);
  }

  const runsQuery = useRuns({
    status: filters.status ?? undefined,
    repo: filters.repo ?? undefined,
    page,
  });

  const hasFilters = filters.status !== null || filters.repo !== null;

  if (runsQuery.isPending) {
    return <p className="text-muted-foreground text-sm">Loading runs…</p>;
  }

  if (runsQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        Couldn’t load runs: {runsQuery.error.message}
      </p>
    );
  }

  const { data: runs, total, per_page } = runsQuery.data;

  // True empty — no runs at all — routes the user forward to the trigger.
  if (total === 0 && !hasFilters) {
    return (
      <div className="mx-auto w-full max-w-275">
        <RouteEmptyState
          title="No runs yet"
          description="Trigger Roomba on a Linear issue and watch it open a pull request."
          actionHref="/runs/new"
          actionLabel="New run"
          icon={<ListChecks className="size-8" aria-hidden />}
        />
      </div>
    );
  }

  // Guard the divisor: per_page is an external envelope value; a 0/absent one
  // would yield Infinity/NaN and break the footer + Next-button disabling.
  const pageSize = per_page > 0 ? per_page : runs.length || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto flex w-full max-w-275 flex-col gap-5">
      <RunFilters value={filters} onChange={applyFilters} />

      {runs.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-xl border px-6 py-12 text-center text-sm">
          No runs match these filters.
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilters({ status: null, repo: null })}
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          <RunsTable runs={runs} />

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-mono text-xs">
              Page {page} of {totalPages} · {formatInt(total)}{" "}
              {total === 1 ? "run" : "runs"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft aria-hidden />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
