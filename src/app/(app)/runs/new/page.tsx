"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Layers, Link2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { formatDuration, formatUsd } from "@/lib/format";
import { useIntegrations } from "@/lib/integrations";
import { useLlmProviders } from "@/lib/llm-providers";
import { useLinearIssues, useGithubRepos, useCreateRun } from "@/lib/runs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { GuardrailMeter } from "@/components/instrument/guardrail-meter";
import { RouteEmptyState } from "@/components/instrument/route-empty-state";

const DEFAULT_MAX_COST_USD = "5.00";
const DEFAULT_MAX_ITERATIONS = "50";
const DEFAULT_MAX_WALL_CLOCK_SECONDS = "3600";

export default function NewRunPage() {
  const router = useRouter();

  const integrationsQuery = useIntegrations();
  const providersQuery = useLlmProviders();
  const issuesQuery = useLinearIssues();
  const reposQuery = useGithubRepos();
  const createRun = useCreateRun();

  const [issueOpen, setIssueOpen] = useState(false);
  const [repoOpen, setRepoOpen] = useState(false);
  const [providerOpen, setProviderOpen] = useState(false);

  const [selectedIssueCode, setSelectedIssueCode] = useState<string | null>(
    null,
  );
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);

  const [maxCostUsd, setMaxCostUsd] = useState(DEFAULT_MAX_COST_USD);
  const [maxIterations, setMaxIterations] = useState(DEFAULT_MAX_ITERATIONS);
  const [maxWallClockSeconds, setMaxWallClockSeconds] = useState(
    DEFAULT_MAX_WALL_CLOCK_SECONDS,
  );

  // Gate: wait for critical queries before deciding on empty states
  if (integrationsQuery.isPending || providersQuery.isPending) {
    return (
      <p className="text-muted-foreground text-sm">Loading configuration…</p>
    );
  }

  if (integrationsQuery.isError || providersQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        Couldn't load configuration:{" "}
        {(integrationsQuery.error ?? providersQuery.error)?.message}
      </p>
    );
  }

  const integrations = integrationsQuery.data;
  const providers = providersQuery.data;

  const hasGithub = integrations.some(
    (i) => i.provider === "github" && i.connected,
  );
  const hasLinear = integrations.some(
    (i) => i.provider === "linear" && i.connected,
  );

  if (!hasGithub || !hasLinear) {
    return (
      <RouteEmptyState
        title="Connect your integrations first"
        description="Roomba needs both GitHub and Linear connected to trigger a run."
        actionHref="/integrations"
        actionLabel="Connect integrations"
        icon={<Link2 className="size-8" aria-hidden />}
      />
    );
  }

  if (providers.length === 0) {
    return (
      <RouteEmptyState
        title="No LLM provider configured"
        description="Add a provider before triggering a run."
        actionHref="/providers"
        actionLabel="Add provider"
        icon={<Layers className="size-8" aria-hidden />}
      />
    );
  }

  const issues = issuesQuery.data ?? [];
  const repos = reposQuery.data ?? [];
  const selectedIssue =
    issues.find((i) => i.code === selectedIssueCode) ?? null;
  const selectedProvider = providers.find((p) => p.id === selectedProviderId) ?? null;

  const costCeiling = Number.parseFloat(maxCostUsd) || 0;
  const iterCeiling = parseInt(maxIterations, 10) || 0;
  const timeoutSeconds = parseInt(maxWallClockSeconds, 10) || 0;

  const canSubmit =
    selectedIssue !== null &&
    selectedRepo !== null &&
    selectedProviderId !== null &&
    !createRun.isPending;

  const submitError = createRun.isError ? createRun.error : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIssue || !selectedRepo || !selectedProviderId) return;

    createRun.mutate(
      {
        github_repo: selectedRepo,
        linear_issue: selectedIssue,
        llm_provider_id: selectedProviderId,
        // Normalize to the same parsed value the GuardrailMeter displays so the
        // submitted bound is never out of sync with what the user authorized.
        max_cost_usd: costCeiling > 0 ? costCeiling.toFixed(2) : undefined,
        max_iterations: iterCeiling > 0 ? iterCeiling : undefined,
        max_wall_clock_seconds: timeoutSeconds > 0 ? timeoutSeconds : undefined,
      },
      {
        onSuccess: (run) => {
          router.push(`/runs/${run.id}`);
        },
      },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-240 flex-col gap-6">
      <p className="text-muted-foreground text-sm">
        Pick an issue and repo, set your guardrail bounds, then launch.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Source</CardTitle>
            <CardDescription>
              The Linear issue to resolve and the GitHub repository to work in.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Linear issue</label>
              <Popover open={issueOpen} onOpenChange={setIssueOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={issueOpen}
                    className="w-full justify-between font-normal"
                    disabled={issuesQuery.isPending}
                  >
                    <span className="truncate">
                      {selectedIssue
                        ? `${selectedIssue.code} — ${selectedIssue.title}`
                        : issuesQuery.isPending
                          ? "Loading issues…"
                          : "Select an issue…"}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search issues…" />
                    <CommandList>
                      <CommandEmpty>No issues found.</CommandEmpty>
                      <CommandGroup>
                        {issues.map((issue) => (
                          <CommandItem
                            key={issue.code}
                            value={`${issue.code} ${issue.title}`}
                            onSelect={() => {
                              setSelectedIssueCode(issue.code);
                              setIssueOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4 shrink-0",
                                selectedIssueCode === issue.code
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="text-muted-foreground font-mono text-xs mr-2 shrink-0">
                              {issue.code}
                            </span>
                            <span className="truncate">{issue.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {issuesQuery.isError && (
                <p className="text-destructive text-xs" role="alert">
                  Couldn't load issues: {issuesQuery.error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">GitHub repository</label>
              <Popover open={repoOpen} onOpenChange={setRepoOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={repoOpen}
                    className="w-full justify-between font-normal"
                    disabled={reposQuery.isPending}
                  >
                    <span className="truncate font-mono text-sm">
                      {selectedRepo ??
                        (reposQuery.isPending
                          ? "Loading repos…"
                          : "Select a repository…")}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search repositories…" />
                    <CommandList>
                      <CommandEmpty>No repositories found.</CommandEmpty>
                      <CommandGroup>
                        {repos.map((repo) => (
                          <CommandItem
                            key={repo.full_name}
                            value={repo.full_name}
                            onSelect={() => {
                              setSelectedRepo(repo.full_name);
                              setRepoOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4 shrink-0",
                                selectedRepo === repo.full_name
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="font-mono text-sm">
                              {repo.full_name}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {reposQuery.isError && (
                <p className="text-destructive text-xs" role="alert">
                  Couldn't load repositories: {reposQuery.error.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider</CardTitle>
            <CardDescription>
              The LLM provider Roomba will use for this run.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">LLM provider</label>
              <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={providerOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedProvider?.provider_name ?? "Select a provider…"}
                    </span>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search providers…" />
                    <CommandList>
                      <CommandEmpty>No providers found.</CommandEmpty>
                      <CommandGroup>
                        {providers.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.provider_name}
                            onSelect={() => {
                              setSelectedProviderId(p.id);
                              setProviderOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4 shrink-0",
                                selectedProviderId === p.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {p.provider_name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
            <CardDescription>
              Hard stops enforced by the harness. The agent cannot exceed these
              bounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="max-cost" className="text-sm font-medium">
                  Max spend
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-sm select-none">
                    $
                  </span>
                  <Input
                    id="max-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="5.00"
                    value={maxCostUsd}
                    onChange={(e) => setMaxCostUsd(e.target.value)}
                    className="font-mono w-36"
                  />
                </div>
              </div>
              <GuardrailMeter
                label="max spend"
                current={0}
                ceiling={costCeiling}
                format={(n) => formatUsd(n)}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="max-iterations" className="text-sm font-medium">
                  Max iterations
                </label>
                <Input
                  id="max-iterations"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="50"
                  value={maxIterations}
                  onChange={(e) => setMaxIterations(e.target.value)}
                  className="font-mono w-36"
                />
              </div>
              <GuardrailMeter
                label="max iterations"
                current={0}
                ceiling={iterCeiling}
                format={(n) => String(Math.round(n))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="timeout" className="text-sm font-medium">
                Timeout
              </label>
              <div className="flex items-center gap-3">
                <Input
                  id="timeout"
                  type="number"
                  min="60"
                  step="60"
                  placeholder="3600"
                  value={maxWallClockSeconds}
                  onChange={(e) => setMaxWallClockSeconds(e.target.value)}
                  className="font-mono w-36"
                />
                {timeoutSeconds > 0 && (
                  <span className="text-muted-foreground font-mono text-xs">
                    {formatDuration(timeoutSeconds)} wall-clock
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {submitError && (
            <p className="text-destructive text-sm" role="alert">
              {submitError instanceof ApiError && submitError.fieldErrors
                ? Object.entries(submitError.fieldErrors)
                    .map(([f, msgs]) => `${f}: ${msgs.join(", ")}`)
                    .join(" · ")
                : submitError.message}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!canSubmit}>
              {createRun.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Launching…
                </>
              ) : (
                "Launch run"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
