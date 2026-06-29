import { cn } from "@/lib/utils";

/** A small pulsing Roomba-Blue dot — the canonical "live / active" signal. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary inline-block size-[7px] shrink-0 rounded-full animate-[roomba-pulse_1.4s_ease-in-out_infinite]",
        className,
      )}
    />
  );
}
