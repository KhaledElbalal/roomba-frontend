"use client";

import { useState } from "react";
import {
  Check,
  CircleCheck,
  KeyRound,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  useCreateLlmProvider,
  useDeleteLlmProvider,
  useUpdateLlmProvider,
} from "@/lib/llm-providers";
import type { LlmProvider } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function apiErrorMessage(error: Error | null, fallback: string): string {
  if (error instanceof ApiError) return error.code ?? fallback;
  return error?.message ?? fallback;
}

function modelsToString(models: string[] | null): string {
  return (models ?? []).join(", ");
}

function parseModels(raw: string): string[] {
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export function LlmProviderCard({ provider }: { provider: LlmProvider }) {
  const [editing, setEditing] = useState(false);
  const [replacingKey, setReplacingKey] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [providerName, setProviderName] = useState(provider.provider_name);
  const [baseUrl, setBaseUrl] = useState(provider.base_url ?? "");
  const [models, setModels] = useState(modelsToString(provider.available_models));
  const [newKey, setNewKey] = useState("");

  const update = useUpdateLlmProvider();
  const remove = useDeleteLlmProvider();

  function cancelEdit() {
    setEditing(false);
    setReplacingKey(false);
    setNewKey("");
    setProviderName(provider.provider_name);
    setBaseUrl(provider.base_url ?? "");
    setModels(modelsToString(provider.available_models));
    update.reset();
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const vars = {
      id: provider.id,
      provider_name: providerName.trim() || provider.provider_name,
      base_url: baseUrl.trim() || null,
      available_models: parseModels(models),
      ...(replacingKey && newKey.trim() ? { api_key: newKey.trim() } : {}),
    };
    update.mutate(vars, {
      onSuccess: () => {
        setEditing(false);
        setReplacingKey(false);
        setNewKey("");
      },
    });
  }

  function handleDelete() {
    remove.mutate(provider.id, {
      onSettled: () => setConfirmingDelete(false),
    });
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit provider</CardTitle>
          <CardDescription>
            Updating {provider.provider_name}. Leave "Replace API key" blank to
            keep the existing key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`edit-name-${provider.id}`}
                  className="text-sm font-medium"
                >
                  Provider name
                </label>
                <Input
                  id={`edit-name-${provider.id}`}
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="anthropic"
                  disabled={update.isPending}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`edit-base-${provider.id}`}
                  className="text-sm font-medium"
                >
                  Base URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <Input
                  id={`edit-base-${provider.id}`}
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.anthropic.com"
                  disabled={update.isPending}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`edit-models-${provider.id}`}
                className="text-sm font-medium"
              >
                Available models{" "}
                <span className="text-muted-foreground font-normal">
                  (comma-separated)
                </span>
              </label>
              <Input
                id={`edit-models-${provider.id}`}
                value={models}
                onChange={(e) => setModels(e.target.value)}
                placeholder="claude-opus-4-8, claude-sonnet-4-6"
                disabled={update.isPending}
              />
            </div>

            {!replacingKey ? (
              <button
                type="button"
                onClick={() => setReplacingKey(true)}
                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm transition-colors"
              >
                <KeyRound className="size-3.5" aria-hidden />
                Replace API key
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`edit-key-${provider.id}`}
                  className="text-sm font-medium"
                >
                  New API key
                </label>
                <Input
                  id={`edit-key-${provider.id}`}
                  type="password"
                  autoComplete="new-password"
                  spellCheck={false}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-…"
                  disabled={update.isPending}
                  aria-invalid={update.isError || undefined}
                />
              </div>
            )}

            {update.isError && (
              <p className="text-destructive text-sm" role="alert">
                {apiErrorMessage(update.error, "Couldn't save changes. Try again.")}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={update.isPending || !providerName.trim()}
              >
                {update.isPending ? (
                  <>
                    <LoaderCircle className="animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check aria-hidden />
                    Save
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                disabled={update.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  const modelList = provider.available_models ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono">{provider.provider_name}</CardTitle>
        {provider.base_url && (
          <CardDescription className="font-mono text-xs">
            {provider.base_url}
          </CardDescription>
        )}
        <CardAction>
          <span className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
            <CircleCheck className="text-primary size-4" aria-hidden />
            Key set
          </span>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-3">
          {modelList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modelList.map((model) => (
                <Badge
                  key={model}
                  variant="outline"
                  className="font-mono text-xs"
                >
                  {model}
                </Badge>
              ))}
            </div>
          )}

          {confirmingDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-sm">
                Remove {provider.provider_name}? This cannot be undone and may
                affect existing runs.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden />
                      Removing…
                    </>
                  ) : (
                    <>
                      <Trash2 aria-hidden />
                      Remove
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmingDelete(false);
                    remove.reset();
                  }}
                  disabled={remove.isPending}
                >
                  Cancel
                </Button>
              </div>
              {remove.isError && (
                <p className="text-destructive text-sm" role="alert">
                  {apiErrorMessage(
                    remove.error,
                    "Couldn't remove provider. Try again.",
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 aria-hidden />
                Remove
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AddLlmProviderCard() {
  const [open, setOpen] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [models, setModels] = useState("");
  const [apiKey, setApiKey] = useState("");

  const create = useCreateLlmProvider();

  function reset() {
    setProviderName("");
    setBaseUrl("");
    setModels("");
    setApiKey("");
    create.reset();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    create.mutate(
      {
        provider_name: providerName.trim(),
        base_url: baseUrl.trim() || null,
        available_models: parseModels(models),
        api_key: apiKey,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors"
      >
        <Plus className="size-4" aria-hidden />
        Add provider
      </button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add LLM provider</CardTitle>
        <CardDescription>
          Connect a new provider. API keys are encrypted at rest and never
          re-displayed after saving.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-name" className="text-sm font-medium">
                Provider name
              </label>
              <Input
                id="add-name"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="anthropic"
                disabled={create.isPending}
                required
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-base" className="text-sm font-medium">
                Base URL{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Input
                id="add-base"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.anthropic.com"
                disabled={create.isPending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-models" className="text-sm font-medium">
              Available models{" "}
              <span className="text-muted-foreground font-normal">
                (comma-separated)
              </span>
            </label>
            <Input
              id="add-models"
              value={models}
              onChange={(e) => setModels(e.target.value)}
              placeholder="claude-opus-4-8, claude-sonnet-4-6"
              disabled={create.isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-key" className="text-sm font-medium">
              API key
            </label>
            <Input
              id="add-key"
              type="password"
              autoComplete="new-password"
              spellCheck={false}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-…"
              disabled={create.isPending}
              required
              aria-invalid={create.isError || undefined}
            />
          </div>

          {create.isError && (
            <p className="text-destructive text-sm" role="alert">
              {apiErrorMessage(
                create.error,
                "Couldn't add provider. Check the API key and try again.",
              )}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                create.isPending ||
                !providerName.trim() ||
                !apiKey.trim()
              }
            >
              {create.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden />
                  Adding…
                </>
              ) : (
                <>
                  <Plus aria-hidden />
                  Add provider
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={create.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
