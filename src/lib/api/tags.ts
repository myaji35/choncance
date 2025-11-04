/**
 * Tag API Client (Next.js API Routes)
 */
import type { Tag, TagCategory } from "@/types";

// Determine base URL based on environment
function getBaseUrl() {
  // Browser - use relative URLs
  if (typeof window !== 'undefined') {
    return '';
  }

  // Server-side with custom URL
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Vercel/Production
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development - check PORT env or default to 3010
  const port = process.env.PORT || '3010';
  return `http://localhost:${port}`;
}

export interface TagListResponse {
  tags: Tag[];
}

/**
 * Fetch all tags
 * @param category Optional category filter
 * @returns List of tags
 */
export async function getTags(category?: TagCategory): Promise<Tag[]> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/tags', baseUrl);

  if (category) {
    url.searchParams.append("category", category);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Enable caching for tag data (revalidate every 1 hour)
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.statusText}`);
  }

  const data: TagListResponse = await response.json();
  return data.tags;
}

/**
 * Fetch tags by category (Client-side)
 */
export async function getTagsByCategory(category: TagCategory): Promise<Tag[]> {
  return getTags(category);
}

/**
 * Fetch all tags grouped by category
 */
export async function getTagsGroupedByCategory(): Promise<Record<TagCategory, Tag[]>> {
  const allTags = await getTags();

  const grouped: Record<string, Tag[]> = {
    VIEW: [],
    ACTIVITY: [],
    FACILITY: [],
    VIBE: [],
  };

  allTags.forEach((tag) => {
    if (grouped[tag.category]) {
      grouped[tag.category].push(tag);
    }
  });

  return grouped as Record<TagCategory, Tag[]>;
}
