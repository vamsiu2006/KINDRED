import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export interface LanguageDetectionResult {
  detectedLanguage: string;
  languageCode: string;
  confidence: number;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const detectLanguage = async (text: string): Promise<LanguageDetectionResult> => {
  try {
    const prompt = `Detect the language of this text and respond ONLY with a JSON object in this exact format:
{
  "detectedLanguage": "Language name in English",
  "languageCode": "ISO language code (e.g., en-US, es-ES, fr-FR, hi-IN, zh-CN, ar-SA)",
  "confidence": 0.95
}

Text to analyze: "${text}"

Remember: Respond ONLY with the JSON object, nothing else.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse language detection response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Error detecting language:", error);
    return {
      detectedLanguage: "English",
      languageCode: "en-US",
      confidence: 0.5
    };
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  targetLanguageCode: string,
  sourceLanguage?: string
): Promise<TranslationResult> => {
  try {
    const sourceInfo = sourceLanguage ? `from ${sourceLanguage}` : "from the detected language";
    
    const prompt = `Translate the following text ${sourceInfo} to ${targetLanguage}.
    
CRITICAL RULES:
1. Provide ONLY the translated text, nothing else.
2. Do NOT include explanations, notes, or the original text.
3. Do NOT add quotation marks around the translation.
4. Maintain the same tone, emotion, and context as the original.
5. If the text is already in ${targetLanguage}, return it unchanged.

Text to translate: "${text}"

Translation:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let translatedText = response.text.trim();
    translatedText = translatedText.replace(/^["']|["']$/g, '');

    return {
      translatedText,
      sourceLanguage: sourceLanguage || "auto-detected",
      targetLanguage
    };
  } catch (error) {
    console.error("Error translating text:", error);
    return {
      translatedText: text,
      sourceLanguage: sourceLanguage || "unknown",
      targetLanguage
    };
  }
};

export const translateMessages = async (
  messages: Array<{ text: string; sender: 'user' | 'ai' }>,
  targetLanguage: string,
  targetLanguageCode: string
): Promise<Array<{ text: string; sender: 'user' | 'ai'; originalText?: string }>> => {
  try {
    const translatedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.text.length === 0) return msg;
        
        const translation = await translateText(msg.text, targetLanguage, targetLanguageCode);
        
        return {
          ...msg,
          originalText: msg.text,
          text: translation.translatedText
        };
      })
    );

    return translatedMessages;
  } catch (error) {
    console.error("Error translating messages:", error);
    return messages;
  }
};

export const getBestMatchingLanguageCode = (detectedCode: string, supportedLanguages: Array<{ code: string; name: string }>): string => {
  const baseDetected = detectedCode.split('-')[0].toLowerCase();
  
  const exactMatch = supportedLanguages.find(lang => 
    lang.code.toLowerCase() === detectedCode.toLowerCase()
  );
  if (exactMatch) return exactMatch.code;
  
  const baseMatch = supportedLanguages.find(lang => 
    lang.code.split('-')[0].toLowerCase() === baseDetected
  );
  if (baseMatch) return baseMatch.code;
  
  return 'en-US';
};
