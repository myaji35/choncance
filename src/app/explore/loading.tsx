export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header Skeleton */}
      <div className="mb-12 space-y-4 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-2/3 mx-auto"></div>
        <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto"></div>
      </div>

      {/* Tag Categories Skeleton */}
      <div className="space-y-8 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-10 bg-gray-100 rounded-full w-24"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Property Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                <div className="h-6 bg-gray-100 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
