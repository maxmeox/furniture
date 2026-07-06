export default function GalleryLoading() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-8 w-56 animate-pulse rounded-xl bg-muted" />
        <div className="mx-auto h-5 w-80 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-5 break-inside-avoid overflow-hidden rounded-3xl ring-1 ring-border">
            <div
              className="animate-pulse bg-muted"
              style={{ aspectRatio: i % 3 === 0 ? "3/4" : "4/3" }}
            />
            <div className="space-y-2 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
