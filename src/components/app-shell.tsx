"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ListChecks, Plug, Layers, Plus } from "lucide-react";

import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoombaLockup } from "@/components/roomba-logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/runs", label: "Runs", icon: ListChecks },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/providers", label: "Providers", icon: Layers },
];

/** Per-route top-bar title + mono eyebrow. Longest matching prefix wins. */
const ROUTE_META: { prefix: string; title: string; eyebrow: string }[] = [
  { prefix: "/runs/new", title: "New run", eyebrow: "trigger" },
  { prefix: "/runs", title: "Runs", eyebrow: "monitor" },
  { prefix: "/dashboard", title: "Telemetry", eyebrow: "observability" },
  { prefix: "/integrations", title: "Integrations", eyebrow: "connect" },
  { prefix: "/providers", title: "Providers", eyebrow: "configure" },
];

function routeMeta(pathname: string) {
  if (/^\/runs\/[^/]+$/.test(pathname) && pathname !== "/runs/new") {
    return { title: "Run detail", eyebrow: "inspect" };
  }
  return (
    ROUTE_META.find((m) => pathname.startsWith(m.prefix)) ?? {
      title: "roomba",
      eyebrow: "",
    }
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // Auth gate: a missing session lands on sign-in rather than a broken shell.
  useEffect(() => {
    if (!isPending && !session) router.replace("/auth/sign-in");
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  const meta = routeMeta(pathname);
  const user = session.user;
  const email = user?.email ?? "";
  const name = user?.name || email || "user";
  const initial = (name[0] ?? "u").toUpperCase();

  return (
    <div className="flex min-h-screen">
      <aside className="bg-sidebar border-sidebar-border flex w-60 shrink-0 flex-col border-r">
        <div className="border-sidebar-border flex h-[60px] items-center border-b px-5">
          <Link href="/dashboard" aria-label="roomba — Dashboard">
            <RoombaLockup className="text-[15px]" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-foreground border-primary/30 border"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground border border-transparent"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-sidebar-border border-t p-3">
          <div className="bg-popover border-border flex items-center gap-2.5 rounded-md border p-2.5">
            <div className="from-primary to-signal flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-sm font-semibold text-[oklch(0.1443_0.0143_262.10)]">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{name}</div>
              <div className="text-muted-foreground truncate font-mono text-[10px]">
                {email}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-card/70 sticky top-0 z-20 flex h-[60px] items-center justify-between gap-4 border-b px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-[15.5px] font-semibold tracking-[-0.01em]">
              {meta.title}
            </h1>
            {meta.eyebrow && (
              <Badge
                variant="outline"
                className="text-muted-foreground border-border rounded-[5px] font-mono text-[10.5px] font-normal tracking-[0.12em] uppercase"
              >
                {meta.eyebrow}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="shadow-[0_0_0_1px_rgba(76,141,255,0.4),0_8px_22px_rgba(76,141,255,0.22)]"
            >
              <Link href="/runs/new">
                <Plus aria-hidden />
                New run
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => authClient.signOut().then(() => router.replace("/"))}
              className="from-primary to-signal flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-[oklch(0.1443_0.0143_262.10)]"
              aria-label="Sign out"
              title={`Sign out (${name})`}
            >
              {initial}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
