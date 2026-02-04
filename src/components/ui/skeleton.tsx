import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

// Property Card Skeleton
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 h-full">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Address */}
        <Skeleton className="h-4 w-1/2" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-100">
          <Skeleton className="h-6 w-32 ml-auto" />
        </div>
      </div>
    </div>
  );
}

// Grid Skeleton
export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
