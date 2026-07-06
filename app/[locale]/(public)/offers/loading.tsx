export default function OffersLoading() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-8 w-52 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-5 w-72 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl ring-1 ring-border md:grid md:grid-cols-[1fr_1.2fr]">
            <div className="aspect-[4/3] animate-pulse bg-muted md:aspect-auto" />
            <div className="space-y-3 p-6">
              <div className="h-5 w-24 animate-pulse rounded-lg bg-muted" />
              <div className="h-7 w-3/4 animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="h-11 w-36 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
