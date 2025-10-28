export default function BookingsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-6 bg-gray-100 rounded w-64"></div>
        </div>

        {/* Booking Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="bg-gray-200 w-32 h-32 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-gray-100 rounded w-20"></div>
                    <div className="h-8 bg-gray-100 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
