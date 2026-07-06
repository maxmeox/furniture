export default function PublicLoading() {
  return (
    <div className="container-shell py-10">
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
