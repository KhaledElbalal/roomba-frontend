"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import type { RunStatus } from "@/lib/types";
import { useGithubRepos } from "@/lib/runs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const STATUS_FILTERS: { value: RunStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "queued", label: "Queued" },
  { value: "running", label: "Running" },
  { value: "succeeded", label: "Succeeded" },
  { value: "failed", label: "Failed" },
  { value: "timed_out", label: "Timed out" },
];

export interface RunFilterState {
  status: RunStatus | null;
  repo: string | null;
}

export function RunFilters({
  value,
  onChange,
}: {
  value: RunFilterState;
  onChange: (next: RunFilterState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="border-border bg-card flex items-center gap-0.5 rounded-lg border p-0.5">
        {STATUS_FILTERS.map((option) => {
          const active = value.status === option.value;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onChange({ ...value, status: option.value })}
              aria-pressed={active}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[11px] tracking-[0.04em] transition-colors",
                active
                  ? "bg-primary/14 text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <RepoFilter
        value={value.repo}
        onChange={(repo) => onChange({ ...value, repo })}
      />
    </div>
  );
}

function RepoFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (repo: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const reposQuery = useGithubRepos();
  const repos = reposQuery.data ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="w-56 justify-between font-normal"
        >
          <span className={cn("truncate font-mono text-xs", !value && "text-muted-foreground")}>
            {value ?? "All repositories"}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter by repository…" />
          <CommandList>
            <CommandEmpty>
              {reposQuery.isPending ? "Loading repositories…" : "No repositories found."}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__all__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 size-4 shrink-0", value === null ? "opacity-100" : "opacity-0")}
                />
                All repositories
              </CommandItem>
              {repos.map((repo) => (
                <CommandItem
                  key={repo.full_name}
                  value={repo.full_name}
                  onSelect={() => {
                    onChange(repo.full_name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      value === repo.full_name ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate font-mono text-xs">{repo.full_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
