import { getAllThemes, getPropertiesByThemeId } from "@/lib/mock-data";
import { ThemeSection } from "@/components/theme/theme-section";

export default function ExplorePage() {
  const themes = getAllThemes();

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

      {/* Theme Sections */}
      <div className="space-y-16">
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
