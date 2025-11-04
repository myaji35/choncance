import { getTagsGroupedByCategory } from "@/lib/api/tags";
import { getProperties, getPropertiesByTagName } from "@/lib/api/properties";
import { TagCategorySection } from "@/components/tag/tag-section";
import { PropertyCard } from "@/components/property/property-card";
import { ExploreContent } from "@/components/explore/explore-content";
import { SortSelect, type SortOption } from "@/components/explore/sort-select";
import type { TagCategory } from "@/types";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplorePageProps {
  searchParams: { tag?: string; search?: string; sort?: SortOption };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const selectedTag = searchParams.tag;
  const searchQuery = searchParams.search;
  const sortBy = searchParams.sort || "popular";

  // Parallel fetch: tags and properties at the same time
  const [tagsGrouped, allProperties] = await Promise.all([
    getTagsGroupedByCategory().catch((error) => {
      console.error("Failed to fetch tags:", error);
      return { VIEW: [], ACTIVITY: [], FACILITY: [], VIBE: [] };
    }),
    getProperties().catch((error) => {
      console.error("Failed to fetch properties:", error);
      return [];
    }),
  ]);

  // Filter properties based on tag or search (no additional API calls needed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filteredProperties: any[] | null = null;
  if (selectedTag) {
    // Client-side filtering instead of API call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredProperties = allProperties.filter((property: any) =>
      property.tags.some((tag: any) => tag.name === selectedTag)
    );
  } else if (searchQuery) {
    // Client-side search
    const query = searchQuery.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredProperties = allProperties.filter((property: any) =>
      property.name.toLowerCase().includes(query) ||
      property.description.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      property.tags.some((tag: any) => tag.name.toLowerCase().includes(query))
    );
  }

  // Sort properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortProperties = (properties: any[]) => {
    const sorted = [...properties];

    switch (sortBy) {
      case "popular":
        // Sort by number of bookings (assuming we'll add this field later)
        // For now, sort by createdAt (newest first)
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "rating":
        // Sort by average rating (assuming we'll have review data)
        // For now, keep original order
        return sorted;

      case "price_low":
        return sorted.sort((a, b) =>
          Number(a.pricePerNight) - Number(b.pricePerNight)
        );

      case "price_high":
        return sorted.sort((a, b) =>
          Number(b.pricePerNight) - Number(a.pricePerNight)
        );

      case "latest":
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      default:
        return sorted;
    }
  };

  // Apply sorting to filtered or all properties
  const displayProperties = filteredProperties
    ? sortProperties(filteredProperties)
    : sortProperties(allProperties);

  return (
    <ExploreContent tags={tagsGrouped}>
      {/* Page Header */}
      <div className="mb-8 sm:mb-12 space-y-2 sm:space-y-4 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 text-center">
          테마별 촌캉스 탐색
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center max-w-2xl mx-auto px-4">
          당신의 감성에 맞는 진정한 휴식을 찾아보세요
        </p>
      </div>

      {/* Active Filter Display */}
      {(selectedTag || searchQuery) && (
        <div className="mb-6 sm:mb-8 flex items-center justify-center gap-2 px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-full max-w-full">
            <span className="font-medium text-sm sm:text-base truncate">
              {selectedTag ? `선택된 태그: ${selectedTag}` : `검색: ${searchQuery}`}
            </span>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-primary/20 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Filtered Results or Tag Categories */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 px-4 gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 mb-2">
                검색 결과 ({displayProperties.length}개)
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {selectedTag
                  ? `'${selectedTag}' 태그와 관련된 촌캉스를 찾았습니다`
                  : `'${searchQuery}'에 대한 검색 결과입니다`}
              </p>
            </div>
            <SortSelect />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      ) : filteredProperties && filteredProperties.length === 0 ? (
        <div className="mb-12 sm:mb-16 md:mb-20 text-center py-12 sm:py-16 px-4">
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            {selectedTag
              ? `'${selectedTag}' 태그와 관련된 촌캉스를 찾을 수 없습니다`
              : `'${searchQuery}'에 대한 검색 결과가 없습니다`}
          </p>
          <Link href="/explore">
            <Button variant="outline" className="text-sm sm:text-base">모든 태그 보기</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Hero Section with Featured Properties */}
          {allProperties.length > 0 && (
            <div className="mb-12 sm:mb-16 md:mb-20">
              <div className="text-center mb-8 sm:mb-12 px-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 mb-3 sm:mb-4">
                  이번 주 추천 촌캉스
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">
                  엄선된 숙소에서 특별한 휴식을 경험하세요
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {allProperties.slice(0, 3).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}

          {/* Tag Categories Section */}
          <div className="mb-12 sm:mb-16 md:mb-20 space-y-12 sm:space-y-16">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 mb-2">
                테마별로 찾아보세요
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                원하는 분위기와 경험으로 완벽한 촌캉스를 발견하세요
              </p>
            </div>

            {Object.entries(tagsGrouped).map(([category, tags]) => {
              // Get properties for the first tag in this category (as featured)
              const firstTag = tags[0];
              const featuredProperties = firstTag
                ? allProperties
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .filter((p) => p.tags.some((t: any) => t.name === firstTag.name))
                    .slice(0, 3)
                : [];

              return (
                <div key={category} className="space-y-4 sm:space-y-6">
                  <TagCategorySection
                    category={category as TagCategory}
                    tags={tags}
                  />

                  {/* Featured Properties for This Category */}
                  {featuredProperties.length > 0 && (
                    <div className="mt-4 sm:mt-6">
                      <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4 text-center px-4">
                        &apos;{firstTag.name}&apos; 추천 숙소
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {featuredProperties.map((property) => (
                          <PropertyCard key={property.id} property={property} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </ExploreContent>
  );
}
