
import { createLocationToken } from "../utils/location-selection-token";

interface NominatimResult {
  place_id: number;
  osm_type: string;
  osm_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    country_code?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
  };
}

export interface LocationSearchResult {
  selectionToken: string;
  displayName: string;
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  countryCode?: string;
  attribution: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const cache = new Map<
  string,
  {
    expiresAt: number;
    results: LocationSearchResult[];
  }
>();

let requestQueue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queueNominatimRequest<T>(
  request: () => Promise<T>
): Promise<T> {
  const task = requestQueue.then(async () => {
    const waitMs = Math.max(
      0,
      1100 - (Date.now() - lastRequestAt)
    );

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    lastRequestAt = Date.now();
    return request();
  });

  requestQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task as Promise<T>;
}

async function fetchNominatim(
  query: string
): Promise<NominatimResult[]> {
  const userAgent = process.env.NOMINATIM_USER_AGENT;
  const contact = process.env.OPINION_PLATFORM_CONTACT;

  if (!userAgent || !contact) {
    throw new Error(
      "Nominatim environment variables are missing"
    );
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    countrycodes: "in",
    limit: "5",
    addressdetails: "1",
    email: contact,
  });

  const response = await queueNominatimRequest(() =>
    fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": `${userAgent} (${contact})`,
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(8000),
      }
    )
  );

  if (!response.ok) {
    throw new Error(
      `Nominatim returned HTTP ${response.status}`
    );
  }

  return (await response.json()) as NominatimResult[];
}

export async function searchLocations(
  rawQuery: string
): Promise<LocationSearchResult[]> {
  const query = rawQuery.trim().replace(/\s+/g, " ");
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const results = await fetchNominatim(query);

  const mapped: LocationSearchResult[] = results
    .map((item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return null;
      }

      const address = item.address ?? {};
      const displayName = item.display_name;

      const selectionToken = createLocationToken({
        displayName,
        latitude,
        longitude,
        osmType: item.osm_type,
        osmId: String(item.osm_id),
        countryCode: address.country_code?.toUpperCase(),
        city:
          address.city ??
          address.town ??
          address.village ??
          address.municipality,
        region: address.state,
      });

      return {
        selectionToken,
        displayName,
        latitude,
        longitude,
        city:
          address.city ??
          address.town ??
          address.village ??
          address.municipality,
        region: address.state,
        countryCode: address.country_code?.toUpperCase(),
        attribution: "© OpenStreetMap contributors",
      };
    })
    .filter(
      (item): item is LocationSearchResult =>
        item !== null
    );

  cache.set(cacheKey, {
    results: mapped,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return mapped;
}
