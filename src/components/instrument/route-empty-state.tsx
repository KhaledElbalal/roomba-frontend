import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Empty states must ROUTE, never dead-end. Renders a short message and a CTA
 * that navigates the user to the next step (e.g. no integration → Integrations).
 */
export function RouteEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
  className,
}: {
  title: string;
  description?: string;
  actionHref: string;
  actionLabel: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col items-center gap-3 rounded-xl border px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
      <Button asChild size="sm">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
