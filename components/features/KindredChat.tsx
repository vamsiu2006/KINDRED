import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Language } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { generateChatResponse, analyzeImage } from '../../services/gemini';
import { speakTextInstantly } from '../../services/audio';
import { saveChatMessage } from '../../services/chatHistory';
import { fileToBase64 } from '../../utils/helpers';
import { SUPPORTED_LANGUAGES, ICONS } from '../../constants';
import { detectLanguage, translateText } from '../../services/translation';
import LoadingSpinner from '../ui/LoadingSpinner';
import MicButton from '../ui/MicButton';
import CameraCapture from './CameraCapture';

interface KindredChatProps {
  user: User;
  onUserOnboarded: () => void;
}

const KindredLogoAvatar = () => (
    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-emerald-500/30 circuit-logo overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 217, 255, 0.1))'
    }}>
      <img 
        src="/kindred-logo.jpg" 
        alt="Kindred AI" 
        className="h-full w-full object-cover"
      />
    </div>
);

const KindredChat: React.FC<KindredChatProps> = ({ user, onUserOnboarded }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPassiveListening, setIsPassiveListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const language: Language = SUPPORTED_LANGUAGES.find(l => l.code === user.languageCode) || SUPPORTED_LANGUAGES[0];
  const chatHistoryKey = `kindred_chat_history_${user.name}`;
  const audioActivationRef = useRef<HTMLAudioElement>(null);
  const hasShownIntroduction = useRef(false);
  const lastUserName = useRef(user.name);

  const addMessage = useCallback((text: string, sender: 'user' | 'ai', image?: string, originalText?: string, detectedLanguage?: string) => {
      const newMessage: Message = {
          id: `${sender}-${Date.now()}`,
          text,
          sender,
          timestamp: new Date().toISOString(),
          ...(image && { image }),
          ...(originalText && { originalText }),
          ...(detectedLanguage && { detectedLanguage }),
      };
      setMessages(prev => [...prev, newMessage]);
      
      saveChatMessage(user.name, sender === 'user' ? 'user' : 'kindred', text).catch(err => {
        console.error('Failed to save chat message to database:', err);
      });
      
      return newMessage;
  }, [user.name]);

  const speakText = useCallback(async (text: string, tone: 'soothing' | 'cheerful' | 'neutral' = 'neutral', speechLanguageCode?: string) => {
    try {
      setIsSpeaking(true);
      await speakTextInstantly(text, user.voiceName, speechLanguageCode || language.code);
    } catch (error) {
      console.error("Failed to speak text:", error);
    } finally {
      setIsSpeaking(false);
      if (isVoiceMode) {
        startListening(false);
      }
    }
  }, [user.voiceName, isVoiceMode, language.code]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if ((!messageText.trim() && !pendingImage) || isLoading) return;

    if(pendingImage) {
        handleImageAnalysis(messageText.trim() || "What do you see in this image?", pendingImage);
        setInput('');
        return;
    }

    const text = messageText.toLowerCase();
    const visualKeywords = ['see', 'watch', 'seeing', 'visual', 'look at', 'picture', 'image', 'describe this'];

    let userMessageToSend = messageText;
    let detectedLang: string | undefined;
    let originalUserText: string | undefined;

    if (user.translationEnabled && user.autoDetectLanguage) {
      try {
        const detection = await detectLanguage(messageText);
        detectedLang = detection.detectedLanguage;
        
        if (detection.languageCode !== language.code && detection.confidence > 0.6) {
          const translation = await translateText(messageText, language.name, language.code);
          userMessageToSend = translation.translatedText;
          originalUserText = messageText;
        }
      } catch (error) {
        console.error("Translation detection failed:", error);
      }
    }

    addMessage(messageText, 'user', undefined, originalUserText, detectedLang);
    setInput('');

    if (visualKeywords.some(kw => text.includes(kw))) {
        const response = "Of course. Please use the camera button to show me what you'd like me to see.";
        addMessage(response, 'ai');
        speakText(response, 'cheerful');
        return;
    }

    setIsLoading(true);

    try {
      const aiTextResponse = await generateChatResponse(user.name, userMessageToSend, messages, language.name);
      
      let aiMessageToDisplay = aiTextResponse;
      let aiOriginalText: string | undefined;

      if (user.translationEnabled && originalUserText && detectedLang) {
        try {
          const aiTranslation = await translateText(aiTextResponse, detectedLang, language.code);
          aiMessageToDisplay = aiTranslation.translatedText;
          aiOriginalText = aiTextResponse;
        } catch (error) {
          console.error("AI response translation failed:", error);
        }
      }
      
      addMessage(aiMessageToDisplay, 'ai', undefined, aiOriginalText);
      setIsLoading(false);

      speakText(aiMessageToDisplay, 'cheerful');
    } catch (error) {
      console.error("Failed to get response from AI", error);
      const errorMsg = "I'm sorry, I'm having trouble connecting right now. Please try again.";
      addMessage(errorMsg, 'ai');
      setIsLoading(false);
      speakText(errorMsg, 'soothing');
    }
  }, [isVoiceMode, isLoading, pendingImage, user, messages, language, addMessage, speakText]);


  const handleWakeWord = useCallback(() => {
    setIsPassiveListening(false);
    setIsVoiceMode(true);
    if(audioActivationRef.current) {
        audioActivationRef.current.play();
    }
  }, []);
  
  const handleSpeechEnd = useCallback((finalTranscript: string) => {
      if (isVoiceMode && finalTranscript) {
          const command = finalTranscript.toLowerCase().replace('hey kindred', '').trim();
          if(command) {
              handleSendMessage(command);
          } else {
              // If only wake word was said, just start listening again actively.
              startListening(false);
          }
      } else if (!isVoiceMode && finalTranscript) {
          // Regular mic button usage - auto-submit the message
          const command = finalTranscript.toLowerCase().replace('hey kindred', '').trim();
          if(command) {
              handleSendMessage(command);
              setInput(''); // Clear input after sending
          }
      }
      setIsPassiveListening(false);
  }, [isVoiceMode, handleSendMessage]);

  const { isListening, transcript, setTranscript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition(language.code, {
      wakeWord: 'hey kindred',
      onWakeWord: handleWakeWord,
      onSpeechEnd: handleSpeechEnd
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has changed - if so, reset the introduction flag
    if (lastUserName.current !== user.name) {
      hasShownIntroduction.current = false;
      lastUserName.current = user.name;
    }
    
    // If we've already shown the introduction for this user, don't show it again
    if (hasShownIntroduction.current) {
      return;
    }
    
    // Onboarding logic for new users
    if (!user.hasBeenOnboarded) {
      hasShownIntroduction.current = true;
      
      const introductionText = `Hello ${user.name}! I'm Kindred, your personal AI companion designed to support your health and wellness journey. I'm here to provide empathetic conversations, help you track your well-being, and assist with your daily health needs.

Here's what I can help you with:

🗣️ Kindred Chat: Have meaningful conversations with me - I'm here to listen, support, and chat about anything on your mind. You can type or use voice by saying "Hey Kindred".

📸 Visual Assistant: Show me images using the camera button, and I'll help identify medications, read labels, or explain what you're seeing.

🏥 Medical Manager: Upload your prescription images and I'll create medication schedules, track your doses, and remind you of safety precautions.

📊 Creative Dashboard: Track your daily emotional, mental, physical, and medical well-being with personalized AI insights and weekly reports.

💬 Chat History: Review our past conversations anytime - I remember our talks so you can look back on your progress.

I use voice interaction for a natural conversation experience, and I'm available whenever you need support, guidance, or just someone to talk to.

How are you feeling today?`;
      
      setTimeout(() => {
        addMessage(introductionText, 'ai');
        speakText(introductionText, 'cheerful');
      }, 1000);
      
      setTimeout(() => onUserOnboarded(), 2000);
      return;
    }

    const storedHistory = localStorage.getItem(chatHistoryKey);
    if (storedHistory) {
      try {
        setMessages(JSON.parse(storedHistory));
      } catch (error) {
          console.error("Failed to parse chat history:", error);
          setMessages([]);
      }
    } else {
        hasShownIntroduction.current = true;
        const welcomeMessage: Message = {
            id: 'welcome-1',
            text: `Hello ${user.name}, welcome back! How are you feeling today?`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
        }
        setMessages([welcomeMessage]);
        setTimeout(() => {
          speakText(welcomeMessage.text, 'cheerful');
        }, 500);
    }
  }, [user.name, user.hasBeenOnboarded, chatHistoryKey, onUserOnboarded, addMessage, speakText]);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history to localStorage:", error);
      }
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatHistoryKey]);

  useEffect(() => {
    // This effect now primarily updates the input field for visual feedback
    if (isListening && transcript) {
        const command = transcript.toLowerCase().replace('hey kindred', '').trim();
        setInput(command);
    }
  }, [transcript, isListening]);
  
  const handleImageAnalysis = async (prompt: string, imageFile: File) => {
    setIsLoading(true);
    const imageSrc = URL.createObjectURL(imageFile);
    addMessage(prompt, 'user', imageSrc);
    
    try {
        const base64Image = await fileToBase64(imageFile);
        const result = await analyzeImage(base64Image, imageFile.type, prompt);
        addMessage(result, 'ai');
        setIsLoading(false);
        speakText(result, 'cheerful');
    } catch(err) {
        console.error(err);
        const errorMsg = "Sorry, I had trouble analyzing that image.";
        addMessage(errorMsg, 'ai');
        setIsLoading(false);
        speakText(errorMsg, 'soothing');
    } finally {
        setPendingImage(null);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
        stopListening();
        setIsPassiveListening(false);
        setIsVoiceMode(false);
    } else {
        startListening(true);
        setIsPassiveListening(true);
        setIsVoiceMode(false);
    }
  };

  const handlePhotoCaptured = (file: File) => {
      setPendingImage(file);
      setIsCameraOpen(false);
  };

  return (
    <>
    {isCameraOpen && <CameraCapture onCapture={handlePhotoCaptured} onClose={() => setIsCameraOpen(false)} />}

    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <KindredLogoAvatar />}
            <div className={`message-${msg.sender === 'user' ? 'user' : 'ai'} max-w-xs md:max-w-md lg:max-w-lg transition-all duration-300 hover:scale-[1.02]`}>
              {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto border border-emerald-500/20" />}
              <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {user.showOriginalText && msg.originalText && (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-1">Original:</p>
                  <p className="text-white/80 text-xs whitespace-pre-wrap leading-relaxed">{msg.originalText}</p>
                </div>
              )}
              {msg.detectedLanguage && user.translationEnabled && (
                <div className="mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {msg.detectedLanguage}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-3 justify-start">
                <KindredLogoAvatar />
                <div className="max-w-lg px-4 py-3 rounded-2xl glass-card border-emerald-500/20 rounded-bl-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" style={{background: 'linear-gradient(135deg, #00ff88, #00d9ff)'}}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{background: 'linear-gradient(135deg, #00d9ff, #ff3366)'}}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{background: 'linear-gradient(135deg, #00ff88, #ff3366)'}}></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 text-center gradient-text text-sm h-6 font-medium" style={{
        background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        {isPassiveListening && "Say 'Hey Kindred' to start a voice conversation."}
        {isVoiceMode && !isListening && !isSpeaking && "Voice Mode Active - Speak to continue..."}
        {isListening && !isPassiveListening && "Listening..."}
        {isSpeaking && "Speaking..."}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 relative">
            {pendingImage && (
                <div className="absolute bottom-full left-0 mb-2 w-full p-2 bg-black/50 rounded-lg">
                   <div className="relative w-24 h-24">
                     <img src={URL.createObjectURL(pendingImage)} alt="Preview" className="w-full h-full object-cover rounded-md" />
                     <button onClick={() => setPendingImage(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                     </button>
                   </div>
                </div>
            )}
            <input
            type="text"
            value={input}
            onChange={(e) => {
                setInput(e.target.value);
                if (isVoiceMode || isPassiveListening) {
                    stopListening();
                    setIsVoiceMode(false);
                    setIsPassiveListening(false);
                }
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder={isListening ? "Listening..." : "Type or say something..."}
            className="input-glass w-full pl-4 pr-12 py-3 rounded-full"
            />
             <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || (!input.trim() && !pendingImage)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white hover:scale-110 disabled:cursor-not-allowed transition-all duration-300 disabled:opacity-50"
                style={{
                  background: isLoading || (!input.trim() && !pendingImage) 
                    ? 'linear-gradient(135deg, #4a5568, #718096)' 
                    : 'linear-gradient(135deg, #00ff88, #00d9ff)'
                }}
             >
                {isLoading ? <LoadingSpinner size="w-5 h-5" /> : ICONS.send('w-5 h-5')}
            </button>
        </div>
        <button onClick={() => setIsCameraOpen(true)} className="p-3 rounded-full glass-card border-emerald-500/20 text-emerald-400 hover:text-white hover:border-emerald-500/40 hover:scale-110 transition-all duration-300">
            {ICONS.camera('w-6 h-6')}
        </button>
        {hasRecognitionSupport && (
            <MicButton isListening={isListening} isSpeaking={isSpeaking} onClick={handleMicClick} />
        )}
      </div>
      <audio ref={audioActivationRef} src="https://storage.googleapis.com/gemini-codelab-assets/activation.mp3" preload="auto" />
    </div>
    </>
  );
};

export default KindredChat;