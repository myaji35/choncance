import type { Tag, TagCategory } from "@/types";
import { TagList } from "./tag-badge";

interface TagSectionProps {
  title: string;
  description?: string;
  tags: Tag[];
}

/**
 * TagSection component - displays a section of tags with title
 * Server Component
 */
export function TagSection({ title, description, tags }: TagSectionProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 sm:space-y-4 px-2 sm:px-0">
      <div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-light text-gray-800 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <TagList tags={tags} />
    </section>
  );
}

const CATEGORY_LABELS: Record<TagCategory, { title: string; description: string }> = {
  VIEW: {
    title: "풍경 테마",
    description: "아름다운 전망과 함께하는 촌캉스",
  },
  ACTIVITY: {
    title: "액티비티 테마",
    description: "특별한 체험이 있는 촌캉스",
  },
  FACILITY: {
    title: "편의시설 테마",
    description: "편안한 시설을 갖춘 촌캉스",
  },
  VIBE: {
    title: "분위기 테마",
    description: "원하는 감성의 촌캉스",
  },
};

interface TagCategorySectionProps {
  category: TagCategory;
  tags: Tag[];
}

/**
 * TagCategorySection - displays tags for a specific category
 */
export function TagCategorySection({ category, tags }: TagCategorySectionProps) {
  const { title, description } = CATEGORY_LABELS[category];

  return (
    <TagSection
      title={title}
      description={description}
      tags={tags}
    />
  );
}
