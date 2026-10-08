/**
 * ============================================================================
 * AUTHORITATIVE PRECISE GEOLOCATION SECURITY & AUTHENTICATION GATE SERVICE
 * ============================================================================
 * 
 * Rules & Design:
 * 1. Exactly 2-second timeout (`timeout: 2000ms`, `maximumAge: 0`, `enableHighAccuracy: true`).
 * 2. If valid location with accuracy <= 100 meters is received at any time within 2 seconds -> PASS immediately.
 * 3. Never show a false error on first reading if accuracy > 100m. Continue waiting until deadline.
 * 4. At 2-second deadline: if accuracy <= 100m -> PASS; otherwise FAIL and show precise-location error.
 * 5. PERMISSION_DENIED fails immediately.
 * 6. No IP fallbacks, no cached coordinates.
 */

export type LocationStatus = 'unknown' | 'requesting' | 'verified' | 'blocked';

export type LocationVerificationState =
  | 'VALID'
  | 'VERIFYING'
  | 'BLOCKED'
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'INTERRUPTED'
  | 'UNSUPPORTED'
  | 'APPROXIMATE_BLOCKED';

export interface VerifiedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  city?: string;
  region?: string;
  country?: string;
  address?: string;
}

export type LocationStatusListener = (
  status: LocationStatus,
  location: VerifiedLocation | null,
  errorMessage: string | null
) => void;

export type LocationGuardListener = (
  state: LocationVerificationState,
  location: VerifiedLocation | null,
  errorMessage: string | null
) => void;

export const MAX_LOCATION_AGE_MS = 10 * 60 * 1000;
export const PRECISE_MAX_ACCURACY_METERS = 100; // Strictly <= 100m per instructions

class PreciseLocationGuardService {
  private status: LocationStatus = 'unknown';
  private verifiedLocation: VerifiedLocation | null = null;
  private errorMessage: string | null = null;
  private failureReason: 'PERMISSION_DENIED' | 'SERVICES_DISABLED' | 'APPROXIMATE_BLOCKED' | 'TIMEOUT' | 'UNSUPPORTED' | null = null;

  private isWatcherActive: boolean = false;
  private authFlowCompleted: boolean = false;
  private activeRequestId: number = 0;
  private inFlightPromise: Promise<{ valid: boolean; error: string | null; location: VerifiedLocation | null }> | null = null;

  private listeners: Set<LocationStatusListener> = new Set();
  private legacyListeners: Set<LocationGuardListener> = new Set();
  private authInvalidationCallbacks: Set<() => void> = new Set();

  constructor() {}

  private logLifecycle(event: string, details?: any) {
    const timestamp = new Date().toISOString();
    if (details) {
      console.log(`[GeoLifecycle ${timestamp}] ${event}`, details);
    } else {
      console.log(`[GeoLifecycle ${timestamp}] ${event}`);
    }
  }

  public getStatus(): LocationStatus {
    return this.status;
  }

  public getState(): LocationVerificationState {
    if (this.status === 'verified') return 'VALID';
    if (this.status === 'requesting') return 'VERIFYING';
    if (this.failureReason === 'PERMISSION_DENIED') return 'PERMISSION_DENIED';
    if (this.failureReason === 'SERVICES_DISABLED') return 'SERVICES_DISABLED';
    if (this.failureReason === 'APPROXIMATE_BLOCKED') return 'APPROXIMATE_BLOCKED';
    if (this.failureReason === 'TIMEOUT') return 'TIMEOUT';
    if (this.failureReason === 'UNSUPPORTED') return 'UNSUPPORTED';
    return 'BLOCKED';
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public getVerifiedLocation(): VerifiedLocation | null {
    return this.verifiedLocation;
  }

  public isLocationVerified(): boolean {
    if (this.status !== 'verified' || !this.verifiedLocation) {
      return false;
    }
    if (this.verifiedLocation.accuracy > PRECISE_MAX_ACCURACY_METERS) {
      return false;
    }
    const age = Date.now() - this.verifiedLocation.timestamp;
    if (age > MAX_LOCATION_AGE_MS) {
      return false;
    }
    return true;
  }

  public isPreciseLocationValid(): boolean {
    return this.isLocationVerified();
  }

  public isLocationValid(): boolean {
    return this.isLocationVerified();
  }

  public getAuthLocationPayload() {
    if (!this.isLocationVerified() || !this.verifiedLocation) {
      return null;
    }
    return {
      latitude: this.verifiedLocation.latitude,
      longitude: this.verifiedLocation.longitude,
      accuracy: this.verifiedLocation.accuracy,
      locationTimestamp: this.verifiedLocation.timestamp,
      city: this.verifiedLocation.city,
      region: this.verifiedLocation.region,
      country: this.verifiedLocation.country,
      address: this.verifiedLocation.address
    };
  }

  public getAuthLocationHeaders(): Record<string, string> {
    const payload = this.getAuthLocationPayload();
    if (!payload) return {};
    return {
      'x-user-latitude': payload.latitude.toString(),
      'x-user-longitude': payload.longitude.toString(),
      'x-user-accuracy': payload.accuracy.toString(),
      'x-user-location-timestamp': payload.locationTimestamp.toString()
    };
  }

  public subscribe(callback: LocationGuardListener): () => void {
    this.legacyListeners.add(callback);
    callback(this.getState(), this.verifiedLocation, this.errorMessage);
    return () => {
      this.legacyListeners.delete(callback);
    };
  }

  public subscribeStatus(callback: LocationStatusListener): () => void {
    this.listeners.add(callback);
    callback(this.status, this.verifiedLocation, this.errorMessage);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public onAuthInvalidated(callback: () => void): () => void {
    this.authInvalidationCallbacks.add(callback);
    return () => {
      this.authInvalidationCallbacks.delete(callback);
    };
  }

  private setStatus(newStatus: LocationStatus, error: string | null = null, failure: typeof this.failureReason = null) {
    const prevStatus = this.status;
    this.status = newStatus;
    this.errorMessage = error;
    this.failureReason = failure;

    this.logLifecycle('LOCATION_STATUS_CHANGED', {
      from: prevStatus,
      to: newStatus,
      error,
      failure,
      location: this.verifiedLocation
    });

    const currentState = this.getState();

    this.listeners.forEach(cb => {
      try {
        cb(this.status, this.verifiedLocation, this.errorMessage);
      } catch (e) {
        console.error('[LocationGuard] Status listener error:', e);
      }
    });

    this.legacyListeners.forEach(cb => {
      try {
        cb(currentState, this.verifiedLocation, this.errorMessage);
      } catch (e) {
        console.error('[LocationGuard] Legacy listener error:', e);
      }
    });

    if (newStatus === 'blocked' && prevStatus === 'verified' && !this.authFlowCompleted) {
      this.authInvalidationCallbacks.forEach(cb => {
        try { cb(); } catch {}
      });
    }
  }

  /**
   * Fast, Authoritative Location Verification Gate (Strict 2-Second Multi-Sample Window)
   */
  public async requirePreciseLocation(forceFresh = true): Promise<{ valid: boolean; error: string | null; location: VerifiedLocation | null }> {
    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    if (!forceFresh && this.isLocationVerified()) {
      return { valid: true, error: null, location: this.verifiedLocation };
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by this browser.';
      this.setStatus('blocked', msg, 'UNSUPPORTED');
      return { valid: false, error: msg, location: null };
    }

    const requestId = ++this.activeRequestId;
    this.setStatus('requesting', null, null);
    this.logLifecycle('REQUEST_STARTED', { requestId, forceFresh });

    const verificationPromise = new Promise<{ valid: boolean; error: string | null; location: VerifiedLocation | null }>((resolve) => {
      let isSettled = false;
      let watchId: number | null = null;
      let timeoutId: any = null;
      let bestReading: { lat: number; lon: number; accuracy: number; timestamp: number } | null = null;

      const finish = (result: { valid: boolean; error: string | null; location: VerifiedLocation | null }) => {
        if (isSettled || this.activeRequestId !== requestId) return;
        isSettled = true;
        this.inFlightPromise = null;

        if (watchId !== null) {
          try { navigator.geolocation.clearWatch(watchId); } catch {}
        }
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        resolve(result);
      };

      // Hard 2-second timeout window
      timeoutId = setTimeout(() => {
        if (isSettled || this.activeRequestId !== requestId) return;

        if (bestReading && bestReading.accuracy <= PRECISE_MAX_ACCURACY_METERS) {
          const loc: VerifiedLocation = {
            latitude: bestReading.lat,
            longitude: bestReading.lon,
            accuracy: bestReading.accuracy,
            timestamp: bestReading.timestamp
          };
          this.verifiedLocation = loc;
          this.setStatus('verified', null, null);
          this.enrichWithReverseGeocoding(loc.latitude, loc.longitude);
          finish({ valid: true, error: null, location: loc });
        } else {
          const err = 'Precise location is required. Approximate location is not supported. Please enable Precise location for this site and try again.';
          this.verifiedLocation = null;
          this.setStatus('blocked', err, 'APPROXIMATE_BLOCKED');
          finish({ valid: false, error: err, location: null });
        }
      }, 2000);

      try {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (isSettled || this.activeRequestId !== requestId) return;

            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
            const timestamp = pos.timestamp || Date.now();

            this.logLifecycle('WATCH_POSITION', { lat, lon, accuracy });

            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

            // Keep track of best reading
            if (!bestReading || accuracy < bestReading.accuracy) {
              bestReading = { lat, lon, accuracy, timestamp };
            }

            // If any reading arrives with accuracy <= 100m, pass immediately without waiting for 2s
            if (accuracy <= PRECISE_MAX_ACCURACY_METERS) {
              const loc: VerifiedLocation = {
                latitude: lat,
                longitude: lon,
                accuracy,
                timestamp
              };
              this.verifiedLocation = loc;
              this.setStatus('verified', null, null);
              this.enrichWithReverseGeocoding(lat, lon);
              finish({ valid: true, error: null, location: loc });
            }
          },
          (err) => {
            if (isSettled || this.activeRequestId !== requestId) return;

            this.logLifecycle('WATCH_ERROR', { code: err.code, message: err.message });

            if (err.code === err.PERMISSION_DENIED) {
              const msg = 'Location permission was denied. Please allow location access in your browser to continue.';
              this.verifiedLocation = null;
              this.setStatus('blocked', msg, 'PERMISSION_DENIED');
              finish({ valid: false, error: msg, location: null });
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 2000
          }
        );
      } catch (e) {
        console.warn('[LocationGuard] watchPosition exception:', e);
      }
    });

    this.inFlightPromise = verificationPromise;
    return verificationPromise;
  }

  public async checkNow(forceFresh = true): Promise<boolean> {
    const res = await this.requirePreciseLocation(forceFresh);
    return res.valid;
  }

  private async enrichWithReverseGeocoding(lat: number, lon: number) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (this.verifiedLocation && this.verifiedLocation.latitude === lat && this.verifiedLocation.longitude === lon) {
          this.verifiedLocation.address = data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
          this.verifiedLocation.city = data?.address?.city || data?.address?.town || data?.address?.village || 'Local Area';
          this.verifiedLocation.region = data?.address?.state || data?.address?.region || 'State';
          this.verifiedLocation.country = data?.address?.country || 'Country';
        }
      }
    } catch {}
  }

  public releaseWatcherAfterAuthComplete() {
    this.authFlowCompleted = true;
  }

  public markSessionVerified(): void {
    this.authFlowCompleted = true;
  }

  public isSessionVerified(): boolean {
    return this.authFlowCompleted;
  }

  public getSecondsRemaining(): number {
    return 0;
  }
}

export const locationVerificationService = new PreciseLocationGuardService();
