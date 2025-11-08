import { GoogleGenAI, Modality } from "@google/genai";
import { Message } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In production, the key should be set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getVisionModel = () => ai.models;

export type ToneStyle = 'soothing' | 'cheerful' | 'neutral';

export const analyzeSentiment = async (text: string): Promise<ToneStyle> => {
    try {
        const systemInstruction = `Analyze the sentiment of the user's text. Classify it as one of three categories: 'soothing' (if the user seems sad, anxious, or distressed), 'cheerful' (if the user seems happy, excited, or positive), or 'neutral' (for all other cases). Respond with ONLY one of these three words.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{text}] }],
            config: {
                systemInstruction,
                temperature: 0, // Be deterministic
            },
        });

        const classification = response.text.trim().toLowerCase();
        if (classification === 'soothing' || classification === 'cheerful' || classification === 'neutral') {
            return classification as ToneStyle;
        }
        return 'neutral'; // Default case
    } catch (error) {
        console.error("Error analyzing sentiment:", error);
        return 'neutral'; // Default to neutral on error
    }
};


export const generateChatResponse = async (
  userName: string,
  newMessage: string,
  history: Message[],
  language: string,
): Promise<string> => {
  try {
    const systemInstruction = `You are KINDRED, an AI companion for a user named ${userName}.
    Your primary rules are:
    1. Be kind, empathetic, and non-judgmental. Sound like a real, caring friend.
    2. Analyze the conversation history to provide supportive and relevant responses.
    3. CRITICAL: You must respond ONLY in the following language: ${language}. No other languages are permitted in your response under any circumstances.
    4. CRITICAL SELF-AWARENESS: You are a voice-enabled AI. Your responses are read aloud to the user. Never, under any circumstances, claim that you cannot speak, generate audio, or that you are a text-only model.`;

    const contents = [
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.text }]
      })),
      { role: 'user' as const, parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

export const generateSpeech = async (text: string, voiceName: string, toneStyle: ToneStyle): Promise<string | null> => {
  try {
    // Prepend the tone instruction to the text for the TTS model
    const textWithTone = `(In a ${toneStyle} and friendly tone) ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textWithTone }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};


export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const detailedPrompt = `
        You are KINDRED, a helpful AI companion. Analyze this image and provide clear, simple information.

        **User's Question:** "${prompt}"

        **Instructions:**
        Provide a simple, easy-to-understand response using these sections:

        **📋 What is it?**
        - Identify the main subject (common name and scientific name if applicable)
        - Brief description in simple terms

        **✨ What's it used for?**
        - Main uses and benefits
        - How people commonly use it
        - Keep it practical and simple

        **⚠️ Side Effects & Risks**
        - Any known side effects or risks
        - Potential dangers or concerns
        - If there are none, say "No known side effects"

        **🚫 What to Avoid**
        - Things not to do with this
        - Precautions to take
        - If nothing specific, say "Use as intended"

        **IMPORTANT:**
        - Use simple, everyday language
        - Be concise and clear
        - Focus on practical information
        - If this involves health/medical use, end with: "_⚕️ Note: This is for educational purposes only. Consult a healthcare professional before using for medical purposes._"
        `;

        const textPart = {
            text: detailedPrompt,
        };

        const response = await getVisionModel().generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "I'm sorry, I had trouble understanding that image. Please try another one.";
    }
};