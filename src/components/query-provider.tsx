"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

import { ApiError, redirectToSignIn } from "@/lib/api";

/**
 * App-wide TanStack Query setup with the project's default policies. Consumers
 * (ROO-18+) only call `useQuery`/`useMutation` with `queryKeys.*` and the typed
 * `apiFetch`; staleness, retries, and the auth-failure redirect live here.
 */
function makeQueryClient(): QueryClient {
  // A failed auth check anywhere should funnel the user to sign-in once.
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.isAuthError) {
      redirectToSignIn();
    }
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry client errors (4xx) — auth failures, validation, not
          // found. Retry transient/server errors a couple of times.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One client per browser tab, stable across re-renders (and never shared
  // between requests on the server).
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
