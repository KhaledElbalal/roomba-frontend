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
