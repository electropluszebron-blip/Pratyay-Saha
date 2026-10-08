// Realistic Physical Paper Rustle Effect for Wilting of Words E-Reader
// Operates on an isolated Web Audio API bus completely separate from the background music.
// Never pauses, interrupts, or mutes the background flute soundtrack.

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Generate an in-memory pink-tinted noise buffer for instant zero-latency page turns
  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const bufferSize = ctx.sampleRate; // 1 second buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    
    // Pink-filtered noise for smooth, natural paper fibers
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = lastOut * 0.7 + white * 0.3;
      data[i] = lastOut * 0.75 + white * 0.25;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  /**
   * Plays a subtle, tactile paper-rustle sound effect.
   * Simulates the soft glide of physical book parchment.
   */
  public playPageTurnSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const noiseBuffer = this.getNoiseBuffer(ctx);

      // Subtle organic randomization so successive turns feel naturally human
      const pitchVariance = 0.92 + Math.random() * 0.16; // 0.92 - 1.08
      const duration = 0.17 + Math.random() * 0.04; // 170ms - 210ms
      const baseFreq = 1650 * pitchVariance;

      // 1. Noise source node
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.playbackRate.value = pitchVariance;

      // 2. Highpass filter to eliminate low rumble
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(400, now);

      // 3. Bandpass filter to shape the papery friction resonance
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(baseFreq, now);
      // Gentle downward frequency ramp simulating the leaf settling onto the page
      bandpass.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, now + duration);
      bandpass.Q.setValueAtTime(1.7, now);

      // 4. Subtle dual-envelope (initial paper lift + soft settling flutter)
      const gainNode = ctx.createGain();
      const peakVolume = 0.16; // Very subtle, physical, pleasant

      gainNode.gain.setValueAtTime(0.001, now);
      // Fast attack for crisp contact
      gainNode.gain.linearRampToValueAtTime(peakVolume, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(peakVolume * 0.42, now + 0.06);
      // Soft secondary wave as parchment settles
      gainNode.gain.linearRampToValueAtTime(peakVolume * 0.6, now + 0.095);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Connect isolated audio graph: Source -> Highpass -> Bandpass -> Gain -> Destination
      noiseSource.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Trigger playback
      noiseSource.start(now);
      noiseSource.stop(now + duration + 0.05);

      // Clean up nodes after completion
      setTimeout(() => {
        try {
          noiseSource.disconnect();
          highpass.disconnect();
          bandpass.disconnect();
          gainNode.disconnect();
        } catch {}
      }, (duration + 0.1) * 1000);

    } catch (e) {
      console.warn('Page rustle effect warning:', e);
    }
  }
}

export const soundEffects = new SoundEffectsService();
