export default function CatalogLoading() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 space-y-3">
        <div className="mx-auto h-8 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-5 w-96 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl ring-1 ring-border">
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
