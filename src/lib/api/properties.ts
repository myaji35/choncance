/**
 * Property API Client (Next.js API Routes)
 */

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  pricePerNight: number;
  maxGuests: number;
  images: string[];
  thumbnailUrl?: string | null;
  hostStory?: string | null;
  amenities: string[];
  rules?: string | null;
  checkInTime: string;
  checkOutTime: string;
  minNights: number;
  maxNights: number;
  status: string;
  tags: Array<{
    id: string;
    name: string;
    category: string;
    icon?: string | null;
    color?: string | null;
  }>;
  host: {
    id: string;
    contact: string;
    user: {
      name: string | null;
      image: string | null;
    };
  };
  createdAt: string;
  updatedAt: string;
}

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

export interface PropertyListResponse {
  properties: Property[];
}

/**
 * Fetch all properties with optional tag filtering
 * @param tags Optional array of tag names (e.g., ["#논뷰맛집", "#힐링"])
 * @returns List of properties
 */
export async function getProperties(tags?: string[]): Promise<Property[]> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/properties', baseUrl);

  if (tags && tags.length > 0) {
    url.searchParams.append("tags", tags.join(","));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Enable caching for 60 seconds (revalidate every minute)
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch properties: ${response.statusText}`);
  }

  const data: PropertyListResponse = await response.json();
  return data.properties;
}

/**
 * Fetch properties by tag name
 */
export async function getPropertiesByTagName(tagName: string): Promise<Property[]> {
  return getProperties([tagName]);
}

/**
 * Fetch single property by ID
 */
export async function getPropertyById(id: string): Promise<Property> {
  const baseUrl = getBaseUrl();
  const url = new URL(`/api/properties/${id}`, baseUrl);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Enable caching for 60 seconds
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }

  const { property } = await response.json();
  return property;
}
