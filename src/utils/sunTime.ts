/**
 * ============================================================================
 * SUNRISE & SUNSET ASTRONOMICAL PRESET CALCULATOR (AUTOMATIC NIGHT MODE)
 * ============================================================================
 * 
 * Provides highly-calibrated, math-grounded calculation of local sunrise and
 * sunset times based on the observer's latitude, longitude, and current date.
 * Fallback values are gracefully used if precise coordinates are not active.
 */

export interface SunCycleTimes {
  sunrise: Date;
  sunset: Date;
  isNight: boolean;
  latitude: number;
  longitude: number;
  usingFallback: boolean;
}

/**
 * Calculates sunrise and sunset for a given latitude & longitude.
 * Falls back to local 6:00 AM & 6:00 PM if inputs are unavailable.
 */
export function calculateSunCycle(
  latitude?: number | null,
  longitude?: number | null,
  date: Date = new Date()
): SunCycleTimes {
  // If latitude or longitude are missing, fall back to default times
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    const sunrise = new Date(date);
    sunrise.setHours(6, 0, 0, 0); // 6:00 AM

    const sunset = new Date(date);
    sunset.setHours(18, 0, 0, 0); // 6:00 PM

    const currentHours = date.getHours() + date.getMinutes() / 60;
    const isNight = currentHours < 6 || currentHours >= 18;

    return {
      sunrise,
      sunset,
      isNight,
      latitude: 22.9064, // Default to Chakdaha / Indian Cultural center context if fallback
      longitude: 88.5255,
      usingFallback: true,
    };
  }

  try {
    const latRad = (latitude * Math.PI) / 180;

    // Day of the year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);

    // Solar Declination (approximate formula)
    const declination = 0.409 * Math.sin((2 * Math.PI * (284 + day)) / 365);

    // Hour angle at sunrise/sunset (cos H = -tan(lat) * tan(dec))
    const cosH = -Math.tan(latRad) * Math.tan(declination);

    let H = 0;
    if (cosH >= 1) {
      H = 0; // Polar night: Sun never rises
    } else if (cosH <= -1) {
      H = Math.PI; // Polar day: Sun never sets
    } else {
      H = Math.acos(cosH);
    }

    // Convert hour angle to hours (15 degrees per hour)
    const hHours = (H * 12) / Math.PI;

    // Solar noon calculations
    // getTimezoneOffset() returns minutes west of UTC (e.g. -330 for India UTC+5:30)
    const timezoneOffsetHours = date.getTimezoneOffset() / 60;
    const solarNoonUTC = 12 - longitude / 15;
    const solarNoonLocal = solarNoonUTC - timezoneOffsetHours;

    const sunriseLocalHours = solarNoonLocal - hHours;
    const sunsetLocalHours = solarNoonLocal + hHours;

    const sunrise = new Date(date);
    const sunriseHr = Math.floor(sunriseLocalHours);
    const sunriseMin = Math.floor((sunriseLocalHours % 1) * 60);
    sunrise.setHours(
      Math.max(0, Math.min(23, sunriseHr)),
      Math.max(0, Math.min(59, sunriseMin)),
      0,
      0
    );

    const sunset = new Date(date);
    const sunsetHr = Math.floor(sunsetLocalHours);
    const sunsetMin = Math.floor((sunsetLocalHours % 1) * 60);
    sunset.setHours(
      Math.max(0, Math.min(23, sunsetHr)),
      Math.max(0, Math.min(59, sunsetMin)),
      0,
      0
    );

    const currentTimeMs = date.getTime();
    const isNight = currentTimeMs < sunrise.getTime() || currentTimeMs >= sunset.getTime();

    return {
      sunrise,
      sunset,
      isNight,
      latitude,
      longitude,
      usingFallback: false,
    };
  } catch (error) {
    console.warn('Failed astronomical calculation, falling back to 6AM/6PM:', error);
    // Secure fallback inside catch
    const sunrise = new Date(date);
    sunrise.setHours(6, 0, 0, 0);

    const sunset = new Date(date);
    sunset.setHours(18, 0, 0, 0);

    const currentHours = date.getHours() + date.getMinutes() / 60;
    const isNight = currentHours < 6 || currentHours >= 18;

    return {
      sunrise,
      sunset,
      isNight,
      latitude,
      longitude,
      usingFallback: true,
    };
  }
}
