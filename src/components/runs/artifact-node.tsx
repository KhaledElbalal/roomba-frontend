"use client";

import { useState } from "react";
import {
  Brain,
  ChevronRight,
  Cpu,
  FilePen,
  FileText,
  Terminal,
} from "lucide-react";

import type { Artifact, ArtifactType } from "@/lib/types";
import { llmPayload } from "@/lib/artifacts";
import { formatInt, formatRelativeTime, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MonoCell } from "@/components/instrument/mono-cell";

type IconType = React.ComponentType<{ className?: string }>;

const TYPE_META: Record<ArtifactType, { label: string; Icon: IconType }> = {
  thinking: { label: "thinking", Icon: Brain },
  read_file: { label: "read", Icon: FileText },
  edit_file: { label: "edit", Icon: FilePen },
  run_command: { label: "command", Icon: Terminal },
  llm_call: { label: "llm call", Icon: Cpu },
};

function field(payload: Artifact["payload"], key: string): unknown {
  if (!payload || typeof payload !== "object") return undefined;
  return (payload as Record<string, unknown>)[key];
}

function str(payload: Artifact["payload"], key: string): string | null {
  const v = field(payload, key);
  return typeof v === "string" && v.length > 0 ? v : null;
}

function num(payload: Artifact["payload"], key: string): number | null {
  const v = field(payload, key);
  return typeof v === "number" ? v : null;
}

/** One-line collapsed summary, tuned per artifact type. */
function summarize(artifact: Artifact): string {
  const { payload } = artifact;
  switch (artifact.artifact_type) {
    case "thinking":
      return str(payload, "summary") ?? str(payload, "content") ?? "—";
    case "read_file":
    case "edit_file":
      return str(payload, "path") ?? "—";
    case "run_command":
      return str(payload, "command") ?? str(payload, "note") ?? "—";
    case "llm_call": {
      const p = llmPayload(artifact);
      return p ? `${p.provider} · ${p.model}` : "—";
    }
    default:
      return "—";
  }
}

export function ArtifactNode({
  artifact,
  isLast,
}: {
  artifact: Artifact;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { Icon, label } = TYPE_META[artifact.artifact_type];
  const llm = llmPayload(artifact);
  const absolute = new Date(artifact.created_at).toLocaleString();

  return (
    <li className="relative pl-9">
      {/* Vertical connector to the next node; omitted on the last node so the
          rail terminates cleanly at the final glyph. */}
      {!isLast && (
        <span
          aria-hidden
          className="bg-border absolute top-7 bottom-[-1.25rem] left-[12.5px] w-px"
        />
      )}
      <span
        aria-hidden
        className="border-border bg-card text-muted-foreground absolute top-0.5 left-0 flex size-[26px] items-center justify-center rounded-full border"
      >
        <Icon className="size-3.5" />
      </span>

      <div className="pb-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="hover:bg-foreground/[0.03] -mx-2 flex w-[calc(100%+1rem)] items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "text-muted-foreground mt-1 size-3.5 shrink-0 transition-transform",
              open && "rotate-90",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-muted-foreground font-mono text-[10.5px] tracking-[0.14em] uppercase">
                {label}
              </span>
              <span
                className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums"
                title={absolute}
              >
                {formatRelativeTime(artifact.created_at)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-foreground min-w-0 flex-1 truncate text-sm">
                {summarize(artifact)}
              </span>
              {llm && (
                <span className="flex shrink-0 items-center gap-1.5">
                  {llm.fallback && (
                    <span className="border-signal/30 bg-signal/10 text-signal rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase">
                      fallback
                    </span>
                  )}
                  <MonoCell
                    signal
                    className="border-border bg-background rounded border px-1.5 py-0.5 text-[11px]"
                  >
                    {formatUsd(llm.cost_usd, { precision: 4 })}
                  </MonoCell>
                </span>
              )}
            </div>
          </div>
        </button>

        {open && (
          <div className="mt-2 ml-6">
            <ArtifactPayload artifact={artifact} />
          </div>
        )}
      </div>
    </li>
  );
}

function ArtifactPayload({ artifact }: { artifact: Artifact }) {
  const { payload } = artifact;

  if (artifact.artifact_type === "llm_call") {
    const p = llmPayload(artifact);
    if (!p) return <RawJson payload={payload} />;
    return (
      <div className="border-border bg-background flex flex-col gap-3 rounded-md border p-3">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          <Detail label="provider" value={p.provider} />
          <Detail label="model" value={p.model} />
          <Detail label="input tok" value={formatInt(p.input_tokens)} mono />
          <Detail label="output tok" value={formatInt(p.output_tokens)} mono />
          <Detail
            label="cost"
            value={formatUsd(p.cost_usd, { precision: 4 })}
            mono
            signal
          />
          <Detail label="fallback" value={p.fallback ? "yes" : "no"} mono />
        </dl>
        {p.fallback && (
          <p className="text-signal font-mono text-xs">
            fell back to {p.model} ({p.provider})
          </p>
        )}
      </div>
    );
  }

  if (artifact.artifact_type === "run_command") {
    const command = str(payload, "command");
    const note = str(payload, "note");
    const exit = num(payload, "exit_status");
    const stdout = str(payload, "stdout");
    const stderr = str(payload, "stderr");
    return (
      <div className="border-border bg-background flex flex-col gap-3 rounded-md border p-3">
        {command ? (
          <div className="flex items-center gap-2">
            <code className="text-foreground min-w-0 flex-1 truncate font-mono text-xs">
              $ {command}
            </code>
            {exit != null && (
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase",
                  exit === 0
                    ? "text-muted-foreground bg-muted-foreground/12"
                    : "text-destructive bg-destructive/14",
                )}
              >
                exit {exit}
              </span>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">{note ?? "—"}</p>
        )}
        {stdout && <OutputBlock label="stdout" text={stdout} />}
        {stderr && <OutputBlock label="stderr" text={stderr} />}
      </div>
    );
  }

  if (artifact.artifact_type === "thinking") {
    const text = str(payload, "summary") ?? str(payload, "content") ?? "—";
    return (
      <p className="border-border bg-background text-foreground rounded-md border p-3 text-sm whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  // read_file / edit_file and any future type: show the structured fields then
  // the raw payload, so nothing the harness records is hidden.
  const path = str(payload, "path");
  const bytes = num(payload, "bytes");
  return (
    <div className="border-border bg-background flex flex-col gap-2 rounded-md border p-3">
      {path && (
        <code className="text-foreground font-mono text-xs break-all">
          {path}
          {bytes != null && (
            <span className="text-muted-foreground"> · {formatInt(bytes)} B</span>
          )}
        </code>
      )}
      <RawJson payload={payload} bare />
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
  signal = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  signal?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-muted-foreground font-mono text-[10px] tracking-[0.1em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate text-xs",
          mono && "font-mono tabular-nums",
          signal && "text-signal",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function OutputBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground font-mono text-[10px] tracking-[0.1em] uppercase">
        {label}
      </span>
      <pre className="border-border text-muted-foreground max-h-64 overflow-auto rounded border p-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
    </div>
  );
}

function RawJson({
  payload,
  bare = false,
}: {
  payload: Artifact["payload"];
  bare?: boolean;
}) {
  return (
    <pre
      className={cn(
        "text-muted-foreground overflow-auto font-mono text-[11px] leading-relaxed",
        !bare && "border-border bg-background rounded-md border p-3",
      )}
    >
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}
