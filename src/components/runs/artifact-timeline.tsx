"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, CircleCheck, ExternalLink, OctagonAlert } from "lucide-react";

import type { ArtifactType, RunDetail, RunStatus } from "@/lib/types";
import {
  failureLabel,
  isActiveStatus,
  liveCostUsd,
  llmCallCount,
} from "@/lib/artifacts";
import { formatInt, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LiveDot } from "@/components/instrument/live-dot";
import { MonoCell } from "@/components/instrument/mono-cell";
import { ArtifactNode } from "./artifact-node";

type Filter = ArtifactType | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "llm_call", label: "LLM calls" },
  { value: "edit_file", label: "Edits" },
  { value: "run_command", label: "Commands" },
  { value: "read_file", label: "Reads" },
  { value: "thinking", label: "Thinking" },
];

const TERMINAL_TONE: Record<RunStatus, string> = {
  queued: "text-muted-foreground",
  running: "text-primary",
  succeeded: "text-[oklch(0.78_0.15_158)]",
  failed: "text-destructive",
  timed_out: "text-[oklch(0.80_0.13_85)]",
};

export function ArtifactTimeline({ run }: { run: RunDetail }) {
  const [filter, setFilter] = useState<Filter>("all");
  const running = isActiveStatus(run.status);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);
  const [pinned, setPinned] = useState(true);

  // Pin-to-newest: a sentinel at the tail tells us whether the user is parked at
  // the bottom. Once they scroll up the sentinel leaves the viewport and we stop
  // auto-scrolling, so reading an earlier node isn't yanked away by a new poll.
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        pinnedRef.current = entry.isIntersecting;
        setPinned(entry.isIntersecting);
      },
      { rootMargin: "0px 0px 96px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll only when nodes are *appended* live — never on initial mount, so
  // the header stays in view on load and the viewport follows the stream after.
  const count = run.artifacts.length;
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current && running && pinnedRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevCount.current = count;
  }, [count, running]);

  const shown =
    filter === "all"
      ? run.artifacts
      : run.artifacts.filter((a) => a.artifact_type === filter);

  const liveCost = liveCostUsd(run.artifacts);
  const calls = llmCallCount(run.artifacts);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.08em] transition-colors",
                  active
                    ? "border-primary/30 bg-primary/12 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {running && <LiveDot />}
          <span className="text-muted-foreground font-mono text-[10px] tracking-[0.12em] uppercase">
            spend so far
          </span>
          <MonoCell signal className="text-sm">
            {formatUsd(liveCost, { precision: 4 })}
          </MonoCell>
          <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
            · {formatInt(calls)} {calls === 1 ? "call" : "calls"}
          </span>
        </div>
      </div>

      {run.artifacts.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground flex items-center gap-2 rounded-xl border px-6 py-10 text-sm">
          {running && <LiveDot />}
          {running
            ? "Waiting for the agent to record its first step…"
            : "No artifacts were recorded for this run."}
        </div>
      ) : (
        <div className="border-border bg-card rounded-xl border px-5 py-5">
          {shown.length === 0 ? (
            <p className="text-muted-foreground py-4 text-sm">
              No artifacts of this type.
            </p>
          ) : (
            <ol className="flex flex-col">
              {shown.map((artifact, i) => (
                <ArtifactNode
                  key={artifact.id}
                  artifact={artifact}
                  isLast={i === shown.length - 1 && running}
                />
              ))}
              {!running && <TerminalNode run={run} />}
            </ol>
          )}
          <div ref={bottomRef} aria-hidden className="h-px" />
        </div>
      )}

      {running && !pinned && (
        <button
          type="button"
          onClick={() => {
            pinnedRef.current = true;
            setPinned(true);
            bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }}
          className="border-border bg-card text-muted-foreground hover:text-foreground sticky bottom-4 mx-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs shadow-lg backdrop-blur"
        >
          <ArrowDown className="size-3.5" aria-hidden />
          Jump to latest
        </button>
      )}
    </section>
  );
}

function TerminalNode({ run }: { run: RunDetail }) {
  const succeeded = run.status === "succeeded";
  const Icon = succeeded ? CircleCheck : OctagonAlert;
  const tone = TERMINAL_TONE[run.status];

  return (
    <li className="relative pl-9">
      <span
        aria-hidden
        className={cn(
          "border-border bg-card absolute top-0.5 left-0 flex size-[26px] items-center justify-center rounded-full border",
          tone,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-h-[26px] flex-col justify-center gap-1">
        <span className={cn("text-sm font-medium", tone)}>
          {succeeded ? "Run succeeded" : failureLabel(run)}
        </span>
        {succeeded && run.github_pr_url ? (
          <a
            href={run.github_pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 font-mono text-xs"
          >
            View pull request
            <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          !succeeded && (
            <span className="text-muted-foreground font-mono text-xs">
              the harness stopped the run at this bound
            </span>
          )
        )}
      </div>
    </li>
  );
}
