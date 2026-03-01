import type { RawPropertyData } from "../types";

const PLACES_API_URL = "https://maps.googleapis.com/maps/api/place";

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  photos?: Array<{ photo_reference: string }>;
  types?: string[];
}

interface PlacesTextSearchResponse {
  results: GooglePlace[];
  next_page_token?: string;
  status: string;
}

/**
 * Google Places Text Search API로 펜션 검색
 * 환경 변수: GOOGLE_PLACES_API_KEY
 */
export async function fetchGooglePlaces(
  query: string,
  region?: string
): Promise<RawPropertyData[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("[Google] GOOGLE_PLACES_API_KEY 미설정 — 건너뜀");
    return [];
  }

  const searchQuery = region ? `${region} ${query}` : query;
  const url = new URL(`${PLACES_API_URL}/textsearch/json`);
  url.searchParams.set("query", searchQuery);
  url.searchParams.set("language", "ko");
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Google Places API 오류: ${res.status}`);

    const data = (await res.json()) as PlacesTextSearchResponse;

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[Google] API 응답 오류:", data.status);
      return [];
    }

    return data.results.map((place): RawPropertyData => {
      let thumbnailUrl: string | undefined;
      if (place.photos?.[0]?.photo_reference && apiKey) {
        const photoUrl = new URL(`${PLACES_API_URL}/photo`);
        photoUrl.searchParams.set("maxwidth", "400");
        photoUrl.searchParams.set("photo_reference", place.photos[0].photo_reference);
        photoUrl.searchParams.set("key", apiKey);
        thumbnailUrl = photoUrl.toString();
      }

      return {
        source: "google",
        sourceId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry?.location.lat,
        lng: place.geometry?.location.lng,
        phone: place.formatted_phone_number,
        rating: place.rating,
        ratingMax: 5,
        reviewCount: place.user_ratings_total,
        thumbnailUrl,
      };
    });
  } catch (err) {
    console.error("[Google] 수집 오류:", err);
    return [];
  }
}
