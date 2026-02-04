export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>

        {/* Gallery Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="bg-gray-200 aspect-[16/9] rounded-lg w-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Info Skeleton */}
          <div className="lg:col-span-2 space-y-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-100 rounded-full w-20"></div>
                <div className="h-8 bg-gray-100 rounded-full w-20"></div>
                <div className="h-8 bg-gray-100 rounded-full w-20"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            </div>

            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Widget Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4 p-6 border rounded-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="space-y-2">
                <div className="h-12 bg-gray-100 rounded"></div>
                <div className="h-12 bg-gray-100 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
