export default function ListingsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-12 w-40 animate-pulse rounded-xl bg-surface" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-surface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="aspect-[4/3] w-full animate-pulse bg-surface2" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-surface2" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
