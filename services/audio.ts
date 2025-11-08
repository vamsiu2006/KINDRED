// This is a browser-only utility.

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
};

export const getBestVoice = (preference: string): SpeechSynthesisVoice | null => {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  // Voice preference mapping
  const voicePatterns: { [key: string]: string[] } = {
    'female-us': ['Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa', 'female', 'woman', 'en-US', 'en_US'],
    'female-uk': ['Kate', 'Serena', 'female', 'woman', 'en-GB', 'en_GB'],
    'female-natural': ['Google US English', 'Microsoft Zira', 'female', 'natural'],
    'male-us': ['Alex', 'Tom', 'male', 'man', 'en-US', 'en_US'],
    'male-uk': ['Daniel', 'Oliver', 'male', 'man', 'en-GB', 'en_GB'],
    'auto': ['Google', 'Microsoft', 'Samantha', 'Karen', 'natural']
  };

  const patterns = voicePatterns[preference] || voicePatterns['auto'];
  
  // Try to find voice matching patterns
  for (const pattern of patterns) {
    const voice = voices.find(v => 
      v.name.toLowerCase().includes(pattern.toLowerCase()) ||
      v.lang.toLowerCase().includes(pattern.toLowerCase())
    );
    if (voice) return voice;
  }

  // Fallback: prefer English female voices
  const englishFemale = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
  );
  if (englishFemale) return englishFemale;

  // Final fallback: any English voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0];
};

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
      
      // Get the best voice based on user preference
      const selectedVoice = voiceName ? getBestVoice(voiceName) : getBestVoice('auto');
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Configure speech parameters for natural, fluent speech
      utterance.rate = 0.95;   // Slightly slower for clarity and naturalness
      utterance.pitch = 1.05;  // Slightly higher for warmth (works well for female voices)
      utterance.volume = 1.0;  // Full volume

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
