import { cn } from "@/lib/utils";

/**
 * Monospace, tabular-aligned numeric cell for costs/durations/counts/timestamps.
 * Right-aligned by default; `signal` tints it Roomba light-blue (use for the
 * headline cost figure).
 */
export function MonoCell({
  children,
  className,
  signal = false,
  align = "right",
}: {
  children: React.ReactNode;
  className?: string;
  signal?: boolean;
  align?: "left" | "right";
}) {
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        align === "right" ? "text-right" : "text-left",
        signal && "text-signal",
        className,
      )}
    >
      {children}
    </span>
  );
}
