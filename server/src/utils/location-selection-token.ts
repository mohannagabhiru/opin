
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export interface SelectedLocation {
  displayName: string;
  latitude: number;
  longitude: number;
  osmType: string;
  osmId: string;
  countryCode?: string;
  city?: string;
  region?: string;
}

interface TokenPayload extends SelectedLocation {
  expiresAt: number;
}

function getSecret(): string {
  const secret = process.env.LOCATION_SELECTION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "LOCATION_SELECTION_SECRET must be configured"
    );
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createLocationToken(
  location: SelectedLocation
): string {
  const payload: TokenPayload = {
    ...location,
    expiresAt: Date.now() + 30 * 60 * 1000,
  };

  const encoded = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  return `${encoded}.${sign(encoded)}`;
}

export function verifyLocationToken(
  token: string
): SelectedLocation | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [encoded, providedSignature] = parts;
    const expectedSignature = sign(encoded);

    const provided = Buffer.from(
      providedSignature,
      "base64url"
    );
    const expected = Buffer.from(
      expectedSignature,
      "base64url"
    );

    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as TokenPayload;

    if (
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt < Date.now() ||
      typeof payload.displayName !== "string" ||
      typeof payload.osmType !== "string" ||
      typeof payload.osmId !== "string" ||
      !Number.isFinite(payload.latitude) ||
      !Number.isFinite(payload.longitude) ||
      payload.latitude < -90 ||
      payload.latitude > 90 ||
      payload.longitude < -180 ||
      payload.longitude > 180
    ) {
      return null;
    }

    return {
      displayName: payload.displayName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      osmType: payload.osmType,
      osmId: payload.osmId,
      countryCode: payload.countryCode,
      city: payload.city,
      region: payload.region,
    };
  } catch {
    return null;
  }
}
