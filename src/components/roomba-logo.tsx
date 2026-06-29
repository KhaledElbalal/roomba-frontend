// components/roomba-logo.tsx
// The Roomba "open loop" mark. Inherits color from `currentColor` unless overridden.
// Usage:
//   <RoombaLogo className="h-8 w-auto text-primary" />        // symbol only
//   <RoombaLockup className="h-8" />                          // symbol + wordmark
import * as React from "react";
import { cn } from "@/lib/utils";

export function RoombaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={cn("text-primary", className)} aria-label="Roomba">
      <path
        d="M73 24.3 A38 38 0 1 1 47 24.3"
        stroke="currentColor"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* the node: the agent docking into its container */}
      <circle cx="60" cy="22" r="8" className="fill-signal" />
    </svg>
  );
}

export function RoombaLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <RoombaLogo className="h-[1.15em] w-auto" />
      <span className="font-sans font-semibold tracking-[-0.035em] text-[1em] leading-none">
        roomba
      </span>
    </span>
  );
}
