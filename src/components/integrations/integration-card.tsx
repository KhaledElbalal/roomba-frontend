"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleCheck,
  ExternalLink,
  LoaderCircle,
  Plug,
  Trash2,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  useConnectIntegration,
  useDisconnectIntegration,
} from "@/lib/integrations";
import type { IntegrationProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ProviderConfig {
  provider: IntegrationProvider;
  name: string;
  description: string;
  /** Where the user creates a PAT, deep-linked to the minimum scopes where possible. */
  tokenUrl: string;
  tokenUrlLabel: string;
  /** Explicit minimum-scope guidance — under-scoped tokens are the common failure. */
  scopeHint: string;
  inputLabel: string;
  placeholder: string;
}

/** Pull the human-readable message out of a mutation error, preferring the API's. */
function errorMessage(error: Error | null, fallback: string): string {
  if (error instanceof ApiError) {
    return error.code ?? fallback;
  }
  return error?.message ?? fallback;
}

export function IntegrationCard({
  config,
  connected,
}: {
  config: ProviderConfig;
  connected: boolean;
}) {
  const [token, setToken] = useState("");
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  const connect = useConnectIntegration();
  const disconnect = useDisconnectIntegration();

  // While a connect is in flight, keep showing the form (with a pending button)
  // even though the cache is optimistically connected — the connected state
  // collapses in only once the server confirms (or stays on error).
  const showConnected = connected && !connect.isPending;

  function handleConnect(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    connect.mutate(
      { provider: config.provider, token: trimmed },
      // The token is never re-displayed — only the connected status persists.
      { onSuccess: () => setToken("") },
    );
  }

  function handleDisconnect() {
    disconnect.mutate(config.provider, {
      onSettled: () => setConfirmingDisconnect(false),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.name}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
        <CardAction>
          {showConnected ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CircleCheck className="size-4 text-primary" aria-hidden />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Plug className="size-4" aria-hidden />
              Not connected
            </span>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        {showConnected ? (
          <div className="flex flex-col gap-3">
            {confirmingDisconnect ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Disconnect {config.name}? Roomba will forget the stored token;
                  you can reconnect with a new one at any time.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? (
                      <>
                        <LoaderCircle className="animate-spin" aria-hidden />
                        Disconnecting…
                      </>
                    ) : (
                      <>
                        <Trash2 aria-hidden />
                        Disconnect
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmingDisconnect(false)}
                    disabled={disconnect.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Roomba is using your {config.name} token.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmingDisconnect(true)}
                >
                  <Trash2 aria-hidden />
                  Disconnect
                </Button>
              </div>
            )}

            {disconnect.isError && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage(disconnect.error, "Couldn’t disconnect. Try again.")}
              </p>
            )}
          </div>
        ) : (
          <form className="flex flex-col gap-2" onSubmit={handleConnect}>
            <label
              htmlFor={`${config.provider}-token`}
              className="text-sm font-medium"
            >
              {config.inputLabel}
            </label>
            <div className="flex gap-2">
              <Input
                id={`${config.provider}-token`}
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder={config.placeholder}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                disabled={connect.isPending}
                aria-invalid={connect.isError || undefined}
              />
              <Button
                type="submit"
                disabled={connect.isPending || token.trim().length === 0}
              >
                {connect.isPending ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden />
                    Connecting…
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {config.scopeHint}{" "}
              <Link
                href={config.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-foreground underline underline-offset-4"
              >
                {config.tokenUrlLabel}
                <ExternalLink className="size-3" aria-hidden />
              </Link>
            </p>

            {connect.isError && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage(
                  connect.error,
                  "Couldn’t connect with that token. Check it and try again.",
                )}
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/** Provider catalogue rendered on the integrations page (one card each). */
export const PROVIDERS: ProviderConfig[] = [
  {
    provider: "github",
    name: "GitHub",
    description: "Read repositories and open pull requests on your behalf.",
    tokenUrl:
      "https://github.com/settings/tokens/new?scopes=repo&description=Roomba",
    tokenUrlLabel: "Create a GitHub token",
    scopeHint:
      "Use a classic personal access token with the repo scope so Roomba can read your code and open PRs.",
    inputLabel: "GitHub personal access token",
    placeholder: "ghp_…",
  },
  {
    provider: "linear",
    name: "Linear",
    description: "Read issues and post updates as runs progress.",
    tokenUrl: "https://linear.app/settings/api",
    tokenUrlLabel: "Create a Linear API key",
    scopeHint:
      "Create a personal API key under Settings → API. Linear keys grant full account access, so use one dedicated to Roomba.",
    inputLabel: "Linear personal API key",
    placeholder: "lin_api_…",
  },
];
