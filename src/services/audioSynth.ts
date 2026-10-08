// Singleton Background Audio Engine for Wilting of Words
// Plays background soundtrack when toggled in readers.

const SOUNDTRACK_URL = '/wilting_of_words_soundtrack.mp3';

class SingleBackgroundMusicEngine {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private userExplicitlyPaused: boolean = false;
  private listeners: ((playing: boolean) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.getOrCreateAudio(), { once: true });
      } else {
        this.getOrCreateAudio();
      }
    }
  }

  public init() {
    this.getOrCreateAudio();
  }

  public getOrCreateAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;

    const existingEl = document.getElementById('exclusive-bg-music-player') as HTMLAudioElement | null;
    if (existingEl) {
      this.audio = existingEl;
      if (!this.audio.src.includes('wilting_of_words_soundtrack')) {
        this.audio.src = SOUNDTRACK_URL;
      }
    } else {
      this.audio = new Audio(SOUNDTRACK_URL);
      this.audio.id = 'exclusive-bg-music-player';
      if (typeof document !== 'undefined' && document.body) {
        document.body.appendChild(this.audio);
      }
    }

    this.audio.loop = true;
    this.audio.volume = 0.8;
    this.audio.muted = false;
    this.audio.preload = 'auto';

    this.audio.onplay = () => {
      this.isPlaying = true;
      this.userExplicitlyPaused = false;
      this.notify();
    };

    this.audio.onplaying = () => {
      this.isPlaying = true;
      this.userExplicitlyPaused = false;
      this.notify();
    };

    this.audio.onpause = () => {
      if (this.userExplicitlyPaused) {
        this.isPlaying = false;
        this.notify();
      }
    };

    this.audio.onended = () => {
      if (this.audio && !this.userExplicitlyPaused) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    };

    return this.audio;
  }

  public unlockAudioContext() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch {}
  }

  public attemptAutoPlay() {
    // Silent auto-play attempt
  }

  public play() {
    this.playNow();
  }

  public pause() {
    const audio = this.getOrCreateAudio();
    this.userExplicitlyPaused = true;
    audio.pause();
    this.isPlaying = false;
    this.notify();
  }

  public playNow() {
    this.userExplicitlyPaused = false;
    this.unlockAudioContext();
    const audio = this.getOrCreateAudio();

    audio.muted = false;
    audio.volume = 0.8;

    if (!audio.src || !audio.src.includes('wilting_of_words_soundtrack')) {
      audio.src = SOUNDTRACK_URL;
    }

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch((err) => {
        console.warn('[MusicEngine] playNow error:', err);
      });
    }
  }

  public togglePlay() {
    const audio = this.getOrCreateAudio();
    this.unlockAudioContext();

    const isActuallyPlaying = !audio.paused && audio.currentTime > 0;

    if (isActuallyPlaying) {
      this.userExplicitlyPaused = true;
      audio.pause();
      this.isPlaying = false;
      this.notify();
    } else {
      this.userExplicitlyPaused = false;
      audio.volume = 0.8;
      audio.muted = false;

      if (!audio.src || !audio.src.includes('wilting_of_words_soundtrack')) {
        audio.src = SOUNDTRACK_URL;
      }

      audio.play()
        .then(() => {
          this.isPlaying = true;
          this.notify();
        })
        .catch((err) => {
          console.warn('[MusicEngine] togglePlay warning:', err);
        });
    }
  }

  public playTurnSound() {}
  public playAchievementSound() {}

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public subscribe(listener: (playing: boolean) => void) {
    this.listeners.push(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.isPlaying));
  }
}

export const audioSynth = new SingleBackgroundMusicEngine();
