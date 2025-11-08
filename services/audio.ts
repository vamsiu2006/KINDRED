// This is a browser-only utility.

export const speakTextInstantly = async (text: string, voiceName?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('Browser does not support speech synthesis');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voiceName && voices.length > 0) {
        const voice = voices.find(v => v.name.includes(voiceName)) || voices.find(v => v.lang.startsWith('en'));
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Configure speech parameters for pleasant, natural speech
      utterance.rate = 1.0;  // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        resolve(); // Resolve anyway to not block execution
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak text:', error);
      resolve();
    }
  });
};
