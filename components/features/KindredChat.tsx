import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Language } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { generateChatResponse, generateSpeech, analyzeImage, analyzeSentiment } from '../../services/gemini';
import { playAudio } from '../../services/audio';
import { fileToBase64 } from '../../utils/helpers';
import { SUPPORTED_LANGUAGES, ICONS } from '../../constants';
import LoadingSpinner from '../ui/LoadingSpinner';
import MicButton from '../ui/MicButton';
import CameraCapture from './CameraCapture';
import SignLanguageMode from './SignLanguageMode';

interface KindredChatProps {
  user: User;
  onUserOnboarded: () => void;
}

const KindredLogoAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-black/20 flex-shrink-0 flex items-center justify-center border border-teal-500/20">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-7 w-7">
            <defs>
                <linearGradient id="logo-aurora-avatar" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <path 
                fill="url(#logo-aurora-avatar)" 
                d="M50,15 C25,20 20,40 30,60 C35,70 40,85 50,85 C60,85 65,70 70,60 C80,40 75,20 50,15 z" 
                transform="rotate(15 50 50)"
            />
        </svg>
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
  const [isSignModeOpen, setIsSignModeOpen] = useState(false);
  
  const language: Language = SUPPORTED_LANGUAGES.find(l => l.code === user.languageCode) || SUPPORTED_LANGUAGES[0];
  const chatHistoryKey = `kindred_chat_history_${user.name}`;
  const audioActivationRef = useRef<HTMLAudioElement>(null);

  const addMessage = useCallback((text: string, sender: 'user' | 'ai', image?: string) => {
      const newMessage: Message = {
          id: `${sender}-${Date.now()}`,
          text,
          sender,
          timestamp: new Date().toISOString(),
          ...(image && { image }),
      };
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
  }, []);

  const speakText = useCallback(async (text: string, tone: 'soothing' | 'cheerful' | 'neutral' = 'neutral') => {
    try {
      setIsSpeaking(true);
      const audioData = await generateSpeech(text, user.voiceName, tone);
      if (audioData) {
        await playAudio(audioData);
      }
    } catch (error) {
      console.error("Failed to generate or play speech:", error);
    } finally {
      setIsSpeaking(false);
      if (isVoiceMode) {
        startListening(false);
      }
    }
  }, [user.voiceName, isVoiceMode]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if ((!messageText.trim() && !pendingImage) || isLoading) return;

    if(pendingImage) {
        handleImageAnalysis(messageText.trim() || "What do you see in this image?", pendingImage);
        setInput('');
        return;
    }

    const text = messageText.toLowerCase();
    const visualKeywords = ['see', 'watch', 'seeing', 'visual', 'look at', 'picture', 'image', 'describe this'];
    const signKeywords = ['sign language', 'signing', 'sign'];

    addMessage(messageText, 'user');
    setInput('');

    if (visualKeywords.some(kw => text.includes(kw))) {
        const response = "Of course. Please use the camera button to show me what you'd like me to see.";
        addMessage(response, 'ai');
        speakText(response, 'cheerful');
        return;
    }

    if (signKeywords.some(kw => text.includes(kw))) {
        const response = "I'm developing a feature for that! You can try a prototype of my sign language translator by clicking the sign language button in the input bar.";
        addMessage(response, 'ai');
        speakText(response, 'cheerful');
        return;
    }

    setIsLoading(true);

    try {
      const aiTextResponse = await generateChatResponse(user.name, messageText, messages, language.name);
      
      addMessage(aiTextResponse, 'ai');
      setIsLoading(false);

      speakText(aiTextResponse, 'cheerful');
    } catch (error) {
      console.error("Failed to get response from AI", error);
      const errorMsg = "I'm sorry, I'm having trouble connecting right now. Please try again.";
      addMessage(errorMsg, 'ai');
      setIsLoading(false);
      speakText(errorMsg, 'soothing');
    }
  }, [isVoiceMode, isLoading, pendingImage, user, messages, language.name, addMessage, speakText]);


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
    // Onboarding logic for new users
    if (!user.hasBeenOnboarded) {
      const onboardingMessages = [
        { text: `Hello ${user.name}! I'm Kindred, your personal AI companion. It's wonderful to meet you.`, delay: 1000 },
        { text: "I'm here to listen, help, and explore ideas with you. Think of me as a supportive friend.", delay: 2500 },
        { text: "You can talk to me by typing, or you can click the microphone button and say 'Hey Kindred' to start a voice chat. You can also show me things using the camera button!", delay: 4500 },
        { text: "How are you feeling today?", delay: 5500 },
      ];

      let delay = 0;
      onboardingMessages.forEach(msg => {
        delay += msg.delay;
        setTimeout(() => {
          addMessage(msg.text, 'ai');
        }, msg.delay);
      });
      
      setTimeout(() => onUserOnboarded(), delay);
      return; // Skip loading history for the first time
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
        const welcomeMessage: Message = {
            id: 'welcome-1',
            text: `Hello ${user.name}, welcome back!`,
            sender: 'ai',
            timestamp: new Date().toISOString(),
        }
        setMessages([welcomeMessage]);
    }
  }, [user.name, user.hasBeenOnboarded, chatHistoryKey, onUserOnboarded, addMessage]);

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
    {isSignModeOpen && <SignLanguageMode onClose={() => setIsSignModeOpen(false)} />}

    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <KindredLogoAvatar />}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-teal-500 to-green-500 rounded-br-lg' : 'bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-bl-lg'}`}>
              {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-w-full h-auto" />}
              <p className="text-white text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-3 justify-start">
                <KindredLogoAvatar />
                <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-700/50 rounded-bl-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 text-center text-teal-300 text-sm h-6">
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
            className="w-full pl-4 pr-12 py-3 rounded-full bg-black/30 border border-teal-500/20 text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-teal-400 focus:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all duration-300"
            />
             <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || (!input.trim() && !pendingImage)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
             >
                {isLoading ? <LoadingSpinner size="w-5 h-5" /> : ICONS.send('w-5 h-5')}
            </button>
        </div>
        <button onClick={() => setIsSignModeOpen(true)} className="p-3 rounded-full bg-black/30 border border-teal-500/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            {ICONS.sign('w-6 h-6')}
        </button>
        <button onClick={() => setIsCameraOpen(true)} className="p-3 rounded-full bg-black/30 border border-teal-500/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
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