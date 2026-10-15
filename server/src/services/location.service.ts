const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

interface NominatimAddress {
  country_code?: string;
  state?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
}

interface NominatimResult {
  place_id: number;
  osm_type: string;
  osm_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

export interface LocationSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
  region?: string;
  city?: string;
  osmType: string;
  osmId: string;
  attribution: string;
}

const CACHE_TTL_MS = 20 * 60 * 1000;
const MIN_REQUEST_INTERVAL_MS = 1100;

const cache = new Map<
  string,
  {
    expiresAt: number;
    results: LocationSearchResult[];
  }
>();

let nextRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRateLimit(
  url: string,
): Promise<Response> {
  const task = requestQueue.then(async () => {
    const now = Date.now();

    if (now < nextRequestTime) {
      await wait(nextRequestTime - now);
    }

    nextRequestTime =
      Date.now() + MIN_REQUEST_INTERVAL_MS;

    const response = await fetch(url, {
      headers: {
        "User-Agent": `${process.env.NOMINATIM_USER_AGENT} (${process.env.OPINION_PLATFORM_CONTACT})`,
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(8000),
    });

    return response;
  });

  // Keep the queue operational even if a request fails.
  requestQueue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  const normalizedQuery = query.trim().replace(/\s+/g, " ");

  const cached = cache.get(normalizedQuery);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    q: normalizedQuery,
    countrycodes: "in",
    limit: "5",
    addressdetails: "1",
  });

  const response = await fetchWithRateLimit(
    `${NOMINATIM_URL}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error("LOCATION_PROVIDER_UNAVAILABLE");
  }

  const data: NominatimResult[] = await response.json();

  const results: LocationSearchResult[] = data
    .map((item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      const address = item.address ?? {};

      return {
        displayName: item.display_name,
        latitude,
        longitude,
        countryCode: address.country_code?.toUpperCase(),
        region: address.state,
        city:
          address.city ??
          address.town ??
          address.village ??
          address.municipality ??
          address.county,
        osmType: item.osm_type,
        osmId: String(item.osm_id),
        attribution: "© OpenStreetMap contributors",
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude) &&
        item.latitude >= -90 &&
        item.latitude <= 90 &&
        item.longitude >= -180 &&
        item.longitude <= 180,
    );

  cache.set(normalizedQuery, {
    results,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return results;
}