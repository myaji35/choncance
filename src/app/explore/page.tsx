import { getTagsGroupedByCategory } from "@/lib/api/tags";
import { getProperties, getPropertiesByTagName } from "@/lib/api/properties";
import { TagCategorySection } from "@/components/tag/tag-section";
import { PropertyCard } from "@/components/property/property-card";
import { ExploreContent } from "@/components/explore/explore-content";
import type { TagCategory } from "@/types";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplorePageProps {
  searchParams: { tag?: string; search?: string };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const selectedTag = searchParams.tag;
  const searchQuery = searchParams.search;

  // Fetch tags from backend
  let tagsGrouped;
  try {
    tagsGrouped = await getTagsGroupedByCategory();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    tagsGrouped = { VIEW: [], ACTIVITY: [], FACILITY: [], VIBE: [] };
  }

  // Fetch all properties for featured sections
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allProperties: any[] = [];
  try {
    allProperties = await getProperties();
  } catch (error) {
    console.error("Failed to fetch properties:", error);
  }

  // Fetch properties (with tag filter or search query if provided)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filteredProperties: any[] | null = null;
  if (selectedTag) {
    try {
      filteredProperties = await getPropertiesByTagName(selectedTag);
    } catch (error) {
      console.error("Failed to fetch filtered properties:", error);
      filteredProperties = [];
    }
  } else if (searchQuery) {
    try {
      // Search by property name, description, address
      const allProperties = await getProperties();
      const query = searchQuery.toLowerCase();
      filteredProperties = allProperties.filter(property =>
        property.name.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    } catch (error) {
      console.error("Failed to search properties:", error);
      filteredProperties = [];
    }
  }

  return (
    <ExploreContent tags={tagsGrouped}>
      {/* Page Header */}
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center">
          테마별 촌캉스 탐색
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
          당신의 감성에 맞는 진정한 휴식을 찾아보세요
        </p>
      </div>

      {/* Active Filter Display */}
      {(selectedTag || searchQuery) && (
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
            <span className="font-medium">
              {selectedTag ? `선택된 태그: ${selectedTag}` : `검색: ${searchQuery}`}
            </span>
            <Link href="/explore">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full hover:bg-primary/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Filtered Results or Tag Categories */}
      {filteredProperties && filteredProperties.length > 0 ? (
        <div className="mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              검색 결과 ({filteredProperties.length}개)
            </h2>
            <p className="text-gray-600">
              {selectedTag
                ? `'${selectedTag}' 태그와 관련된 촌캉스를 찾았습니다`
                : `'${searchQuery}'에 대한 검색 결과입니다`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      ) : filteredProperties && filteredProperties.length === 0 ? (
        <div className="mb-20 text-center py-16">
          <p className="text-xl text-gray-600 mb-4">
            {selectedTag
              ? `'${selectedTag}' 태그와 관련된 촌캉스를 찾을 수 없습니다`
              : `'${searchQuery}'에 대한 검색 결과가 없습니다`}
          </p>
          <Link href="/explore">
            <Button variant="outline">모든 태그 보기</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Hero Section with Featured Properties */}
          {allProperties.length > 0 && (
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-light text-gray-800 mb-4">
                  이번 주 추천 촌캉스
                </h2>
                <p className="text-lg text-gray-600">
                  엄선된 숙소에서 특별한 휴식을 경험하세요
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProperties.slice(0, 3).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          )}

          {/* Tag Categories Section */}
          <div className="mb-20 space-y-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-800 mb-2">
                테마별로 찾아보세요
              </h2>
              <p className="text-gray-600">
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
                <div key={category} className="space-y-6">
                  <TagCategorySection
                    category={category as TagCategory}
                    tags={tags}
                  />

                  {/* Featured Properties for This Category */}
                  {featuredProperties.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
                        &apos;{firstTag.name}&apos; 추천 숙소
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
