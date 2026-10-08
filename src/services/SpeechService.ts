// Speech synthesis and recognition service for W.O.W. Assistant

export class SpeechService {
  private synth: SpeechSynthesis;
  private recognition: any = null; // SpeechRecognition

  constructor() {
    this.synth = window.speechSynthesis;
    
    // Check for Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'en-US';
    }
  }

  // TTS
  speak(text: string, onEnd?: () => void) {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => { if (onEnd) onEnd(); };
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
  }

  // Recognition
  startListening(onResult: (text: string) => void) {
    if (!this.recognition) return;
    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    this.recognition.start();
  }
}

export const speechService = new SpeechService();
