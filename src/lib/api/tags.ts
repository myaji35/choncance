import { Tag, TagListResponse } from '@/types/tag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getTags(category?: string): Promise<Tag[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/tags`);
  if (category) {
    url.searchParams.append('category', category);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const data: TagListResponse = await response.json();
  return data.tags;
}
