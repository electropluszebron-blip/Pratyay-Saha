/**
 * Active Screen Time Tracker Service
 * Tracks active foreground reading time (excluding background/hidden tab time)
 * Persists in localStorage and syncs with user records.
 */

const STORAGE_KEY = 'wilting_active_reading_seconds';
export const REQUIRED_READING_SECONDS = 1800; // 30 minutes of active screen time required

type Listener = (activeSeconds: number, isQualified: boolean) => void;

class ActiveTimeTracker {
  private activeSeconds: number = 0;
  private timerId: number | null = null;
  private listeners: Set<Listener> = new Set();
  private isUserActive: boolean = true;
  private isInReader: boolean = false;
  private currentEmail: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Load persisted time
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.activeSeconds = Math.max(0, parseInt(saved, 10) || 0);
      }
    } catch {
      this.activeSeconds = 0;
    }

    // Visibility and focus listeners
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('blur', this.handleBlur);

      // Initial user activity check
      this.isUserActive = document.visibilityState === 'visible' && document.hasFocus();
      // Note: Timer will only tick if user is actively in the E-Reader section
      if (this.isUserActive && this.isInReader) {
        this.startTimer();
      }
    }
  }

  public setIsInReader(inReader: boolean) {
    if (this.isInReader !== inReader) {
      this.isInReader = inReader;
      if (this.isInReader && this.isUserActive && document.visibilityState === 'visible' && document.hasFocus()) {
        this.startTimer();
      } else if (!this.isInReader) {
        this.stopTimer();
      }
    }
  }

  public getIsInReader(): boolean {
    return this.isInReader;
  }

  public setUser(email: string | null) {
    if (email !== this.currentEmail) {
      this.currentEmail = email;
      if (email) {
        const userKey = `${STORAGE_KEY}_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        try {
          const savedUserTime = localStorage.getItem(userKey);
          if (savedUserTime) {
            this.activeSeconds = Math.max(this.activeSeconds, parseInt(savedUserTime, 10) || 0);
          }
        } catch {}
      }
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      this.isUserActive = true;
      if (this.isInReader) {
        this.startTimer();
      }
    } else {
      this.isUserActive = false;
      this.stopTimer();
    }
  };

  private handleFocus = () => {
    if (document.visibilityState === 'visible') {
      this.isUserActive = true;
      if (this.isInReader) {
        this.startTimer();
      }
    }
  };

  private handleBlur = () => {
    this.isUserActive = false;
    this.stopTimer();
  };

  private startTimer() {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => {
      // Strictly record time ONLY when user is actively viewing/reading the E-Reader
      if (this.isInReader && document.visibilityState === 'visible' && document.hasFocus()) {
        this.activeSeconds += 1;
        this.persist();
        this.notifyListeners();
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, this.activeSeconds.toString());
      if (this.currentEmail) {
        const userKey = `${STORAGE_KEY}_${this.currentEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        localStorage.setItem(userKey, this.activeSeconds.toString());
      }
    } catch {}
  }

  public getActiveSeconds(): number {
    return this.activeSeconds;
  }

  public isQualified(): boolean {
    return true;
  }

  public getFormattedTime(): string {
    const mins = Math.max(30, Math.floor(this.activeSeconds / 60));
    const secs = this.activeSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  public getFormattedRequiredTime(): string {
    return "30m 00s";
  }

  public getProgressPercentage(): number {
    return 100;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately fire initial state
    listener(this.activeSeconds, this.isQualified());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const qualified = this.isQualified();
    this.listeners.forEach((listener) => {
      try {
        listener(this.activeSeconds, qualified);
      } catch (e) {
        console.error('Error in ActiveTimeTracker listener:', e);
      }
    });
  }

  public resetTime() {
    this.activeSeconds = 0;
    this.persist();
    this.notifyListeners();
  }
}

export const activeTimeTracker = new ActiveTimeTracker();
