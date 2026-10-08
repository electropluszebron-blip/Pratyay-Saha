// Web Audio API Contextual Ambient Soundscape Generator
class AmbientAudioService {
  private audioCtx: AudioContext | null = null;
  private currentMode: string | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private volume: number = 0.5;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentMode(): string | null {
    return this.isPlaying ? this.currentMode : null;
  }

  public stopSoundscape() {
    this.activeNodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node) (node as any).stop();
          node.disconnect();
        } catch {}
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentMode = null;
  }

  public startSoundscape(mode: 'rain' | 'tanpura' | 'market' | 'courtyard') {
    this.initCtx();
    if (!this.audioCtx || !this.gainNode) return;

    if (this.isPlaying && this.currentMode === mode) {
      this.stopSoundscape();
      return;
    }

    this.stopSoundscape();
    this.isPlaying = true;
    this.currentMode = mode;

    switch (mode) {
      case 'rain':
        this.createRainSoundscape();
        break;
      case 'tanpura':
        this.createTanpuraSoundscape();
        break;
      case 'market':
        this.createMarketBellsSoundscape();
        break;
      case 'courtyard':
        this.createCourtyardSoundscape();
        break;
    }
  }

  // 1. Monsoon Rain & Thunder Generator
  private createRainSoundscape() {
    if (!this.audioCtx || !this.gainNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // 2. Tanpura Drone & Bansuri Drone
  private createTanpuraSoundscape() {
    if (!this.audioCtx || !this.gainNode) return;
    const baseFreq = 138.59; // C#3 Tanpura root
    const harmonics = [1, 1.498, 2, 2.996, 4]; // Pa and Sa harmonics

    harmonics.forEach((h, index) => {
      if (!this.audioCtx || !this.gainNode) return;
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * h, this.audioCtx.currentTime);

      oscGain.gain.setValueAtTime(0.04 / (index + 1), this.audioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();

      this.activeNodes.push(osc, oscGain);
    });
  }

  // 3. Riverbank Market & Bells
  private createMarketBellsSoundscape() {
    if (!this.audioCtx || !this.gainNode) return;
    
    // Wind noise
    const bufferSize = this.audioCtx.sampleRate * 3;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.activeNodes.push(noise, filter);

    // Periodic distant bell chime
    const intervalId = window.setInterval(() => {
      if (!this.audioCtx || !this.gainNode || !this.isPlaying) return;
      const bell = this.audioCtx.createOscillator();
      const bellGain = this.audioCtx.createGain();

      bell.type = 'sine';
      bell.frequency.setValueAtTime(1080 + Math.random() * 200, this.audioCtx.currentTime);

      bellGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 2.5);

      bell.connect(bellGain);
      bellGain.connect(this.gainNode);
      bell.start();
      bell.stop(this.audioCtx.currentTime + 2.5);
    }, 4000);

    this.activeNodes.push(intervalId);
  }

  // 4. Quiet Courtyard Petrichor
  private createCourtyardSoundscape() {
    if (!this.audioCtx || !this.gainNode) return;

    // Gentle breeze noise
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }

    const breeze = this.audioCtx.createBufferSource();
    breeze.buffer = buffer;
    breeze.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);

    breeze.connect(filter);
    filter.connect(this.gainNode);
    breeze.start();
    this.activeNodes.push(breeze, filter);
  }
}

export const ambientAudio = new AmbientAudioService();
