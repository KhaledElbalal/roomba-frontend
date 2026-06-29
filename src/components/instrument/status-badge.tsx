import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/types";
import { LiveDot } from "./live-dot";

// The canonical run status palette. These greens/ambers are the ONLY non-blue
// colors in the product — color is signal, and it appears only on status.
const STATUS: Record<
  RunStatus,
  { label: string; className: string; live?: boolean }
> = {
  queued: {
    label: "Queued",
    className: "text-muted-foreground bg-muted-foreground/12",
  },
  running: {
    label: "Running",
    className: "text-primary bg-primary/14",
    live: true,
  },
  succeeded: {
    label: "Succeeded",
    className: "text-[oklch(0.78_0.15_158)] bg-[oklch(0.78_0.15_158)]/12",
  },
  failed: {
    label: "Failed",
    className: "text-destructive bg-destructive/14",
  },
  timed_out: {
    label: "Timed out",
    className: "text-[oklch(0.80_0.13_85)] bg-[oklch(0.80_0.13_85)]/14",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: RunStatus;
  className?: string;
}) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium",
        s.className,
        className,
      )}
    >
      {s.live ? (
        <LiveDot />
      ) : (
        <span className="size-[6px] shrink-0 rounded-full bg-current opacity-70" />
      )}
      {s.label}
    </span>
  );
}
