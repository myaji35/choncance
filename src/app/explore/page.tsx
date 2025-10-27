import { getAllThemes, getPropertiesByThemeId, getPropertiesByTagName } from "@/lib/mock-data";
import { ThemeSection } from "@/components/theme/theme-section";
import { getTagsGroupedByCategory } from "@/lib/api/tags";
import { TagCategorySection } from "@/components/tag/tag-section";
import type { TagCategory } from "@/types";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExplorePageProps {
  searchParams: { tag?: string };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const themes = getAllThemes();
  const selectedTag = searchParams.tag;

  // Fetch tags from backend
  let tagsGrouped;
  try {
    tagsGrouped = await getTagsGroupedByCategory();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    tagsGrouped = { VIEW: [], ACTIVITY: [], FACILITY: [], VIBE: [] };
  }

  // Filter properties by selected tag
  const filteredProperties = selectedTag
    ? getPropertiesByTagName(selectedTag)
    : null;

  return (
    <div className="container mx-auto px-4 py-12">
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
      {selectedTag && (
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
            <span className="font-medium">선택된 태그: {selectedTag}</span>
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
              &apos;{selectedTag}&apos; 태그와 관련된 촌캉스를 찾았습니다
            </p>
          </div>
          <ThemeSection
            theme={{
              id: "filtered",
              title: `"${selectedTag}" 태그 결과`,
              description: "",
              propertyIds: []
            }}
            properties={filteredProperties}
          />
        </div>
      ) : filteredProperties && filteredProperties.length === 0 ? (
        <div className="mb-20 text-center py-16">
          <p className="text-xl text-gray-600 mb-4">
            &apos;{selectedTag}&apos; 태그와 관련된 촌캉스를 찾을 수 없습니다
          </p>
          <Link href="/explore">
            <Button variant="outline">모든 태그 보기</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Tag Categories Section */}
          <div className="mb-20 space-y-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-gray-800 mb-2">
                촌캉스 태그로 찾기
              </h2>
              <p className="text-gray-600">
                원하는 테마로 완벽한 촌캉스를 발견하세요
              </p>
            </div>

            <div className="space-y-10">
              {Object.entries(tagsGrouped).map(([category, tags]) => (
                <TagCategorySection
                  key={category}
                  category={category as TagCategory}
                  tags={tags}
                />
              ))}
            </div>
          </div>

          {/* Theme Sections */}
          <div className="space-y-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-gray-800 mb-2">
                큐레이션 테마
              </h2>
              <p className="text-gray-600">
                엄선된 촌캉스 테마를 둘러보세요
              </p>
            </div>

            {themes.map((theme) => {
              const properties = getPropertiesByThemeId(theme.id);
              return (
                <ThemeSection
                  key={theme.id}
                  theme={theme}
                  properties={properties}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
