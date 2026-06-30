import { notFound } from "next/navigation";

import { RunDetail } from "@/components/runs/run-detail";

// `params` is a Promise in Next 16 — await before destructuring (see AGENTS.md).
export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const runId = Number.parseInt(id, 10);
  if (!Number.isInteger(runId) || runId <= 0) notFound();

  return <RunDetail id={runId} />;
}
