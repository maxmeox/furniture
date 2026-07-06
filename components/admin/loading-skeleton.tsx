export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
