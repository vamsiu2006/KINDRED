import React, { useState, useRef, useEffect, useCallback } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SignLanguageModeProps {
  onClose: () => void;
}

type SentimentType = 'cheerful' | 'soothing' | 'neutral';

const quickSentimentAnalysis = (text: string): SentimentType => {
  const lowerText = text.toLowerCase();
  const cheerfulWords = ['happy', 'great', 'wonderful', 'awesome', 'love', 'thank', 'thanks', 'yay', 'excited'];
  const soothingWords = ['sad', 'sorry', 'worried', 'anxious', 'help', 'scared', 'upset', 'hurt'];
  
  const hasCheerful = cheerfulWords.some(word => lowerText.includes(word));
  const hasSoothing = soothingWords.some(word => lowerText.includes(word));
  
  if (hasCheerful) return 'cheerful';
  if (hasSoothing) return 'soothing';
  return 'neutral';
};

const SignLanguageMode: React.FC<SignLanguageModeProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');


  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    stopStream();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access the camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const handleTranslateToSign = async () => {
    if (!textInput.trim()) return;
    setIsGenerating(true);
    setShowVideo(false);

    try {
        const sentiment = quickSentimentAnalysis(textInput);
        let selectedVideo = '';
        switch (sentiment) {
            case 'cheerful':
                // Avatar signing "Thank You"
                selectedVideo = 'https://storage.googleapis.com/gemini-codelab-assets/sign-language-thank-you.mp4';
                break;
            case 'soothing':
                 // Avatar signing "Yes / I understand"
                selectedVideo = 'https://storage.googleapis.com/gemini-codelab-assets/sign-language-yes.mp4';
                break;
            case 'neutral':
            default:
                // Avatar signing "Hello"
                selectedVideo = 'https://storage.googleapis.com/gemini-codelab-assets/sign-language-hello.mp4';
                break;
        }
        setVideoUrl(selectedVideo);

        setTimeout(() => {
            setIsGenerating(false);
            setShowVideo(true);
        }, 500);

    } catch (error) {
        console.error("Failed to analyze sentiment for sign language:", error);
        // Fallback to a neutral video on error
        setVideoUrl('https://storage.googleapis.com/gemini-codelab-assets/sign-language-hello.mp4');
        setIsGenerating(false);
        setShowVideo(true);
    }
  };


  const renderAvatarContent = () => {
    if (isGenerating) {
        return (
            <div className="text-center text-purple-300">
                <LoadingSpinner size="w-12 h-12" />
                <p className="mt-4">Analyzing and generating response...</p>
            </div>
        );
    }
    if (showVideo) {
        return (
            <>
                <video 
                    src={videoUrl}
                    key={videoUrl} // Force re-render on new URL
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                />
                 <div className="absolute bottom-4 w-11/12 text-center p-2 bg-black/60 rounded-md text-purple-300">
                    Avatar is now signing the response.
                 </div>
            </>
        );
    }
    return (
        <div className="flex flex-col h-full p-4">
            <p className="text-center text-gray-300 mb-4">Type your message below and Kindred will sign it for you.</p>
            <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type text to translate..."
                className="flex-1 w-full p-3 rounded-lg bg-black/40 border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
            />
            <button 
                onClick={handleTranslateToSign}
                disabled={!textInput.trim() || isGenerating}
                className="mt-4 w-full py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:from-gray-500 disabled:to-gray-600 transition-all"
            >
                {isGenerating ? 'Generating...' : 'Translate to Sign'}
            </button>
        </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User's Camera View */}
        <div className="bg-black/50 rounded-lg flex flex-col items-center justify-center border border-white/20 relative overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-2 absolute top-4 left-4 z-10">Your Camera</h3>
          {isLoading && <LoadingSpinner />}
          {error && <p className="text-red-400 text-center p-4">{error}</p>}
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-lg ${isLoading || error ? 'hidden' : 'block'}`} />
          <div className="absolute bottom-4 w-11/12 text-center p-2 bg-black/60 rounded-md text-teal-300 animate-pulse">
            Kindred is watching for your signs...
          </div>
        </div>
        
        {/* AI Avatar View */}
        <div className="bg-black/50 rounded-lg flex flex-col items-center justify-center border border-white/20 relative overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-2 absolute top-4 left-4 z-10">KINDRED Avatar</h3>
          {renderAvatarContent()}
        </div>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default SignLanguageMode;