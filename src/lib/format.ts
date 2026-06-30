// Formatting helpers for Roomba's mono numerics. Backend serializes decimal
// columns (cost) as strings and bigints as numbers — these tolerate both.

export function formatUsd(
  value: string | number | null | undefined,
  opts?: { precision?: number },
): string {
  if (value == null) return "—";
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return `$${n.toFixed(opts?.precision ?? 2)}`;
}

/** Human duration: `m:ss`, or `h:mm:ss` past an hour. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatInt(value: number | null | undefined): string {
  return value == null ? "—" : value.toLocaleString();
}

/**
 * Elapsed seconds between two ISO timestamps. When `end` is null/absent (a run
 * still in flight) it counts to *now*, so a running row shows live elapsed time
 * that advances on each poll. Returns null when there is no start yet.
 */
export function durationSeconds(
  start: string | null | undefined,
  end: string | null | undefined,
): number | null {
  if (!start) return null;
  const startMs = new Date(start).getTime();
  if (Number.isNaN(startMs)) return null;
  const endMs = end ? new Date(end).getTime() : Date.now();
  if (Number.isNaN(endMs)) return null;
  return Math.max(0, (endMs - startMs) / 1000);
}

/** Compact local timestamp for table cells: `Jun 30, 14:02`. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
