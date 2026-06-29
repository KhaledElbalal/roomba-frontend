import { cn } from "@/lib/utils";

/** A labelled metric: uppercase mono label over a large mono value. */
export function StatTile({
  label,
  value,
  signal = false,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  signal?: boolean;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-muted-foreground font-mono text-[10px] tracking-[0.1em] uppercase">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-lg tabular-nums",
          signal && "text-signal",
        )}
      >
        {value}
      </span>
      {hint && (
        <span className="text-muted-foreground text-xs">{hint}</span>
      )}
    </div>
  );
}
