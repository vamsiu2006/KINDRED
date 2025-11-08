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

  // Common female voice indicators across platforms
  const femaleIndicators = [
    'samantha', 'victoria', 'karen', 'moira', 'tessa', 'susan', 'fiona', 
    'zira', 'jenny', 'aria', 'salli', 'kimberly', 'joanna', 'kendra', 'ivy',
    'kate', 'serena', 'hazel', 'catherine', 'amelie',
    'google uk english female', 'microsoft zira', 'microsoft jenny',
    'female', 'woman', 'girl'
  ];

  const maleIndicators = [
    'alex', 'tom', 'daniel', 'oliver', 'fred', 'ralph', 'david', 'mark',
    'google us english', 'google uk english male', 'google australian',
    'male', 'man'
  ];

  // Check if a voice name suggests it's female
  const isFemaleVoice = (voice: SpeechSynthesisVoice): boolean => {
    const nameLower = voice.name.toLowerCase();
    return femaleIndicators.some(indicator => nameLower.includes(indicator)) &&
           !maleIndicators.some(indicator => nameLower.includes(indicator));
  };

  // Check if a voice name suggests it's male
  const isMaleVoice = (voice: SpeechSynthesisVoice): boolean => {
    const nameLower = voice.name.toLowerCase();
    return maleIndicators.some(indicator => nameLower.includes(indicator));
  };

  // Voice preference matching
  if (preference === 'female-us') {
    // Prefer US English female voices
    const usVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en_US'));
    const femaleUS = usVoices.find(v => isFemaleVoice(v));
    if (femaleUS) return femaleUS;
    
    // Fallback to any English female voice
    const anyFemale = voices.find(v => v.lang.startsWith('en') && isFemaleVoice(v));
    if (anyFemale) return anyFemale;
  }

  if (preference === 'female-uk') {
    // Prefer UK English female voices
    const ukVoices = voices.filter(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
    const femaleUK = ukVoices.find(v => isFemaleVoice(v));
    if (femaleUK) return femaleUK;
    
    // Fallback to any English female voice
    const anyFemale = voices.find(v => v.lang.startsWith('en') && isFemaleVoice(v));
    if (anyFemale) return anyFemale;
  }

  if (preference === 'female-natural') {
    // Prefer Google or Microsoft female voices
    const naturalFemale = voices.find(v => 
      (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('microsoft')) && 
      isFemaleVoice(v)
    );
    if (naturalFemale) return naturalFemale;
    
    // Fallback to any English female voice
    const anyFemale = voices.find(v => v.lang.startsWith('en') && isFemaleVoice(v));
    if (anyFemale) return anyFemale;
  }

  if (preference === 'male-us') {
    // Prefer US English male voices
    const usVoices = voices.filter(v => v.lang.startsWith('en-US') || v.lang.startsWith('en_US'));
    const maleUS = usVoices.find(v => isMaleVoice(v));
    if (maleUS) return maleUS;
    
    // Fallback to any English male voice
    const anyMale = voices.find(v => v.lang.startsWith('en') && isMaleVoice(v));
    if (anyMale) return anyMale;
  }

  if (preference === 'male-uk') {
    // Prefer UK English male voices
    const ukVoices = voices.filter(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
    const maleUK = ukVoices.find(v => isMaleVoice(v));
    if (maleUK) return maleUK;
    
    // Fallback to any English male voice
    const anyMale = voices.find(v => v.lang.startsWith('en') && isMaleVoice(v));
    if (anyMale) return anyMale;
  }

  // Auto mode: prefer female voices with good names
  const qualityFemale = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('google') || 
     v.name.toLowerCase().includes('samantha') ||
     v.name.toLowerCase().includes('zira') ||
     v.name.toLowerCase().includes('jenny')) &&
    isFemaleVoice(v)
  );
  if (qualityFemale) return qualityFemale;

  // Fallback: any English female voice
  const anyEnglishFemale = voices.find(v => v.lang.startsWith('en') && isFemaleVoice(v));
  if (anyEnglishFemale) return anyEnglishFemale;

  // Last resort: first English voice available
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
