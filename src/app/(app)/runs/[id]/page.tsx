// Run Detail — separate ticket. Placeholder so the shell route resolves.
export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="text-muted-foreground text-sm">
      Run detail for {id} — coming soon.
    </div>
  );
}
