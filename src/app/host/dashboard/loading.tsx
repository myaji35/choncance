export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-100 rounded w-96"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-100 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="animate-pulse">
          <div className="flex gap-4 border-b mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded w-24"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="bg-gray-200 w-24 h-24 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
