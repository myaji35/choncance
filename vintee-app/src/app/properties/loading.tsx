export default function PropertiesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-24 animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-[4/3] animate-pulse bg-gray-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
