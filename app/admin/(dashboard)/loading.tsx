import { LoadingSkeleton } from "@/components/admin/loading-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-10 w-64 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
      <LoadingSkeleton />
    </div>
  );
}
