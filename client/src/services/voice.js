// Voice Guidance (Speech Synthesis) and Speech-to-Text for Rural Accessibility

let currentUtterance = null;

export const voiceService = {
  isSynthesisSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  isRecognitionSupported: () => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),

  speak(text, lang = 'en', onStart = null, onEnd = null) {
    if (!this.isSynthesisSupported()) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Map language code to BCP 47 language tag
    const langMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };

    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.92; // Slightly slower, clearer pacing for farmers
    utterance.pitch = 1.0;

    // Pick best available voice for language if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (onStart) utterance.onstart = onStart;
    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stop() {
    if (this.isSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
  },

  listen(lang = 'en', onResult, onError, onEnd) {
    if (!this.isRecognitionSupported()) {
      onError?.('Speech recognition is not supported on this device/browser.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    const langMap = {
      te: 'te-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };

    recognition.lang = langMap[lang] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      onError?.(err.error || 'Could not understand speech.');
    };

    recognition.onend = () => {
      onEnd?.();
    };

    recognition.start();
    return recognition;
  }
};
