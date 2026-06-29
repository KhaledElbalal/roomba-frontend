import { AppShell } from "@/components/app-shell";

// Chrome for all authenticated product screens: sidebar + top bar + auth gate.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
