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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface PropertyListResponse {
  properties: Property[];
}

/**
 * Fetch all properties with optional tag filtering
 * @param tags Optional array of tag names (e.g., ["#논뷰맛집", "#힐링"])
 * @returns List of properties
 */
export async function getProperties(tags?: string[]): Promise<Property[]> {
  const url = new URL(`${API_BASE_URL}/api/properties`);

  if (tags && tags.length > 0) {
    url.searchParams.append("tags", tags.join(","));
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
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
  const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property: ${response.statusText}`);
  }

  const { property } = await response.json();
  return property;
}
