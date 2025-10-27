import { getAllThemes, getPropertiesByThemeId } from "@/lib/mock-data";
import { ThemeSection } from "@/components/theme/theme-section";
import { getTagsGroupedByCategory } from "@/lib/api/tags";
import { TagCategorySection } from "@/components/tag/tag-section";
import type { TagCategory } from "@/types";

export default async function ExplorePage() {
  const themes = getAllThemes();

  // Fetch tags from backend
  let tagsGrouped;
  try {
    tagsGrouped = await getTagsGroupedByCategory();
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    tagsGrouped = { VIEW: [], ACTIVITY: [], FACILITY: [], VIBE: [] };
  }

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
    </div>
  );
}
