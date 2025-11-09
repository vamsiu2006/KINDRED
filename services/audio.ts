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

// Ensure voices are loaded before using them
const ensureVoicesLoaded = (): Promise<void> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }
    
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      resolve();
    };
    
    // Fallback timeout
    setTimeout(() => resolve(), 1000);
  });
};

export const getBestVoiceForLanguage = (languageCode: string, voicePreference?: string): SpeechSynthesisVoice | null => {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  const baseLanguage = languageCode.split('-')[0].toLowerCase();
  
  const languageVoices = voices.filter(v => {
    const voiceLang = v.lang.toLowerCase();
    return voiceLang.startsWith(languageCode.toLowerCase()) || 
           voiceLang.startsWith(baseLanguage);
  });

  if (languageVoices.length === 0) {
    return voices[0];
  }

  if (voicePreference && voicePreference !== 'auto') {
    const femaleIndicators = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'zira', 'jenny'];
    const maleIndicators = ['male', 'man', 'alex', 'tom', 'daniel'];
    
    const isFemale = voicePreference.includes('female');
    const preferredVoices = languageVoices.filter(v => {
      const nameLower = v.name.toLowerCase();
      if (isFemale) {
        return femaleIndicators.some(ind => nameLower.includes(ind));
      } else {
        return maleIndicators.some(ind => nameLower.includes(ind));
      }
    });
    
    if (preferredVoices.length > 0) {
      return preferredVoices[0];
    }
  }

  const googleVoices = languageVoices.filter(v => v.name.toLowerCase().includes('google'));
  if (googleVoices.length > 0) return googleVoices[0];

  return languageVoices[0];
};

export const speakTextInstantly = async (text: string, voiceName?: string, languageCode?: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        console.error('Browser does not support speech synthesis');
        resolve();
        return;
      }

      await ensureVoicesLoaded();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      let selectedVoice: SpeechSynthesisVoice | null = null;
      
      if (languageCode) {
        selectedVoice = getBestVoiceForLanguage(languageCode, voiceName);
        if (selectedVoice) {
          utterance.lang = languageCode;
        }
      } else {
        let mappedVoiceName = voiceName;
        if (voiceName === 'Zephyr' || voiceName === 'Kore' || voiceName === 'Puck' || 
            voiceName === 'Charon' || voiceName === 'Fenrir' || !voiceName) {
          mappedVoiceName = 'female-us';
        }
        selectedVoice = getBestVoice(mappedVoiceName);
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name, 'for language:', languageCode || 'default');
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to speak text:', error);
      resolve();
    }
  });
};
