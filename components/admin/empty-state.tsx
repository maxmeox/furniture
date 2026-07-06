export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <div className="text-xl font-bold">{title}</div>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
