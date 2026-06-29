import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Honest empty state for metrics: below the data threshold, say so and hide
 * deltas rather than render a misleading 100%/0%. This honesty is a feature.
 */
export function NotEnoughData({
  message = "Not enough data in this window to report a trend.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-[oklch(0.80_0.13_85)]/30 bg-[oklch(0.80_0.13_85)]/8 px-3 py-2 text-sm text-[oklch(0.80_0.13_85)]",
        className,
      )}
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
