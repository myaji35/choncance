import { getTagsGroupedByCategory } from "@/lib/api/tags";
import { PropertyCard } from "@/components/property/property-card";
import { ExploreContent } from "@/components/explore/explore-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ExplorePageProps {
  searchParams: {
    tags?: string;
    min_price?: string;
    max_price?: string;
    province?: string;
    city?: string;
    check_in?: string;
    check_out?: string;
    guests?: string;
    pets?: string;
    search?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  // Fetch tags
  let tagsGrouped;
  try {
    tagsGrouped = await getTagsGroupedByCategory();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    tagsGrouped = { VIEW: [], ACTIVITY: [], FACILITY: [], VIBE: [] };
  }

  // Build filter URL for API call
  const filterParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) filterParams.set(key, value);
  });

  // Fetch filtered properties
  let properties = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/properties?${filterParams.toString()}`,
      { cache: "no-store" }
    );
    const data = await response.json();
    properties = data.properties || [];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
  }

  // Calculate active filter count
  const activeFilterCount = Object.keys(searchParams).filter(
    (key) => searchParams[key as keyof typeof searchParams] && key !== "search"
  ).length;

  const hasFilters = activeFilterCount > 0 || searchParams.search;

  return (
    <ExploreContent tags={tagsGrouped} activeFilterCount={activeFilterCount}>
      {/* Page Header */}
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          테마별 촌캉스 탐색
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          당신의 감성에 맞는 진정한 휴식을 찾아보세요
        </p>
      </div>

      {/* Results */}
      {hasFilters ? (
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              검색 결과 ({properties.length}개)
            </h2>
            {searchParams.search && (
              <p className="text-gray-600">
                '{searchParams.search}'에 대한 검색 결과입니다
              </p>
            )}
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">
                조건에 맞는 숙소를 찾을 수 없습니다
              </p>
              <Link href="/explore">
                <Button variant="outline">필터 초기화</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-20">
          {/* All Properties */}
          <div>
            <div className="mb-12">
              <h2 className="text-4xl font-light text-gray-800 mb-4">
                모든 촌캉스
              </h2>
              <p className="text-lg text-gray-600">
                엄선된 숙소에서 특별한 휴식을 경험하세요
              </p>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {properties.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600">아직 등록된 숙소가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ExploreContent>
  );
}
