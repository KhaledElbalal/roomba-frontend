"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";

import { authClient } from "@/lib/auth";

/**
 * Wraps the app tree in Neon Auth's UI provider so prebuilt components
 * (`AuthView`, `SignedIn`, `SignedOut`, hooks, etc.) work.
 *
 * `navigate`/`replace`/`Link` are wired to Next's App Router so the auth views
 * navigate using client-side routing.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
