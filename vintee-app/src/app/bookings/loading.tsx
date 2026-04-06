export default function BookingsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
