import { Request, Response } from 'express';

export const MAX_LOCATION_AGE_MS = 10 * 60 * 1000; // 10 minutes

export interface PreciseLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
}

export interface LocationValidationResult {
  valid: boolean;
  error?: string;
  code?: 'LOCATION_MISSING' | 'LOCATION_COARSE' | 'LOCATION_STALE' | 'LOCATION_INVALID';
  location?: PreciseLocationData;
}

/**
 * Validates that the request includes valid, active GPS coordinates from high-accuracy geolocation.
 * Validates coordinate presence, validity, and freshness without rejecting standard mobile GPS accuracy.
 */
export function validatePreciseLocation(payload: any): LocationValidationResult {
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      code: 'LOCATION_MISSING',
      error: 'Precise location is required to continue. No location coordinates were provided.'
    };
  }

  const latRaw = payload.latitude;
  const lonRaw = payload.longitude;
  const accRaw = payload.accuracy;
  const timeRaw = payload.locationTimestamp ?? payload.timestamp;

  // 1. Coordinate Existence & Type Validation
  if (latRaw === undefined || latRaw === null || lonRaw === undefined || lonRaw === null) {
    return {
      valid: false,
      code: 'LOCATION_MISSING',
      error: 'Precise location is required to continue. GPS coordinates must be provided.'
    };
  }

  const latitude = typeof latRaw === 'number' ? latRaw : parseFloat(String(latRaw));
  const longitude = typeof lonRaw === 'number' ? lonRaw : parseFloat(String(lonRaw));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      valid: false,
      code: 'LOCATION_INVALID',
      error: 'Precise location is required to continue. Latitude and longitude must be valid numbers.'
    };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      valid: false,
      code: 'LOCATION_INVALID',
      error: 'Coordinates out of geographical bounds.'
    };
  }

  const accuracy = accRaw !== undefined && accRaw !== null
    ? (typeof accRaw === 'number' ? accRaw : parseFloat(String(accRaw)))
    : 10;

  if (Number.isFinite(accuracy) && accuracy > 200) {
    return {
      valid: false,
      code: 'LOCATION_COARSE',
      error: 'Precise location is required. Approximate location is not supported. Please enable Precise location in your browser and try again.'
    };
  }

  // 2. Freshness Validation (Reject Stale Coordinates older than MAX_LOCATION_AGE_MS)
  let timestamp = Date.now();
  if (timeRaw !== undefined && timeRaw !== null) {
    const parsedTime = typeof timeRaw === 'number' ? timeRaw : new Date(timeRaw).getTime();
    if (Number.isFinite(parsedTime)) {
      timestamp = parsedTime;
      const ageMs = Date.now() - timestamp;
      if (ageMs > MAX_LOCATION_AGE_MS) {
        return {
          valid: false,
          code: 'LOCATION_STALE',
          error: 'Precise location is required to continue. Location reading is stale.'
        };
      }
      if (ageMs < -60000) {
        return {
          valid: false,
          code: 'LOCATION_INVALID',
          error: 'Location timestamp is in the future. Check device clock.'
        };
      }
    }
  }

  return {
    valid: true,
    location: {
      latitude,
      longitude,
      accuracy: Number.isFinite(accuracy) ? accuracy : 10,
      timestamp,
      city: payload.city,
      region: payload.region,
      country: payload.country,
      address: payload.address
    }
  };
}

/**
 * Extracts location either from the request body or from HTTP headers, then validates it.
 */
export function extractAndValidatePreciseLocation(req: Request, body?: any): LocationValidationResult {
  const payloadFromHeaders = {
    latitude: req.headers['x-user-latitude'] ? parseFloat(req.headers['x-user-latitude'] as string) : undefined,
    longitude: req.headers['x-user-longitude'] ? parseFloat(req.headers['x-user-longitude'] as string) : undefined,
    accuracy: req.headers['x-user-accuracy'] ? parseFloat(req.headers['x-user-accuracy'] as string) : undefined,
    timestamp: req.headers['x-user-location-timestamp'] ? parseInt(req.headers['x-user-location-timestamp'] as string, 10) : undefined,
  };

  const combinedPayload = {
    latitude: body?.latitude ?? body?.location?.latitude ?? payloadFromHeaders.latitude,
    longitude: body?.longitude ?? body?.location?.longitude ?? payloadFromHeaders.longitude,
    accuracy: body?.accuracy ?? body?.location?.accuracy ?? payloadFromHeaders.accuracy,
    locationTimestamp: body?.locationTimestamp ?? body?.timestamp ?? body?.location?.timestamp ?? payloadFromHeaders.timestamp,
    city: body?.city ?? body?.location?.city,
    region: body?.region ?? body?.location?.region,
    country: body?.country ?? body?.location?.country,
    address: body?.address ?? body?.location?.address
  };

  return validatePreciseLocation(combinedPayload);
}

/**
 * Express middleware helper to enforce location on an authentication endpoint.
 */
export function enforcePreciseLocationEndpoint(req: Request, res: Response, body?: any): boolean {
  const result = extractAndValidatePreciseLocation(req, body);
  if (!result.valid) {
    res.status(403).json({
      success: false,
      preciseLocationRequired: true,
      code: result.code,
      error: result.error || 'Precise location is required to continue.'
    });
    return false;
  }
  return true;
}
