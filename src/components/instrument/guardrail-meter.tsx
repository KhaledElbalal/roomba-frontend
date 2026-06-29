import { cn } from "@/lib/utils";

/**
 * A spend/iteration "leash": current value against an authorized ceiling, always
 * shown together. The bar turns destructive and the caption reads "ceiling
 * reached" once the bound trips — guardrails are always visible.
 */
export function GuardrailMeter({
  label,
  current,
  ceiling,
  format = (n) => String(n),
  className,
}: {
  label: string;
  current: number;
  ceiling: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const tripped = ceiling > 0 && current >= ceiling;
  const pct = ceiling > 0 ? Math.min(100, (current / ceiling) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-muted-foreground font-mono text-[10px] tracking-[0.1em] uppercase">
          {label}
        </span>
        <span className="font-mono text-xs tabular-nums">
          <span className={cn(tripped && "text-destructive")}>
            {format(current)}
          </span>
          <span className="text-muted-foreground"> / {format(ceiling)}</span>
        </span>
      </div>
      <div className="bg-background border-border h-[7px] overflow-hidden rounded-full border">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tripped ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "font-mono text-[10px]",
          tripped ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {tripped ? "ceiling reached" : "authorized"}
      </span>
    </div>
  );
}
