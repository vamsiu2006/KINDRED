import { useState, useEffect, useRef, useCallback } from 'react';

const SpeechRecognitionImpl =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// Fix: Add a minimal interface for SpeechRecognition to satisfy TypeScript.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionOptions {
    wakeWord?: string;
    onWakeWord?: () => void;
    onSpeechEnd?: (finalTranscript: string) => void;
}

export const useSpeechRecognition = (language: string, options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordTriggeredRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!SpeechRecognitionImpl) {
      console.error("SpeechRecognition API not supported in this browser.");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }
      
      const fullTranscriptForDisplay = finalTranscriptRef.current + (finalTranscript ? ' ' + finalTranscript : '') + (interimTranscript ? ' ' + interimTranscript : '');
      setTranscript(fullTranscriptForDisplay.trim());

      // Wake word detection logic
      if (options.wakeWord && options.onWakeWord && !wakeWordTriggeredRef.current) {
          if (interimTranscript.toLowerCase().includes(options.wakeWord.toLowerCase())) {
              wakeWordTriggeredRef.current = true;
              options.onWakeWord();
          }
      }
      
      if (finalTranscript) {
        finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalTranscript).trim();
      }

      // Auto-stop after silence: Reset the silence timer whenever new speech is detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // If we have any transcript, set a timer to auto-stop after 1.5 seconds of silence
      if ((finalTranscript || interimTranscript) && recognitionRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current) {
            recognitionRef.current.stop();
          }
        }, 1500); // Stop after 1.5 seconds of silence
      }
    };
    
    recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        
        // Clear the silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        if (options.onSpeechEnd) {
            options.onSpeechEnd(finalTranscriptRef.current);
        }
        finalTranscriptRef.current = '';
        setTranscript('');
    };

    recognition.onerror = (event) => {
        console.error("SpeechRecognition error:", event.error);
        setIsListening(false);
        isListeningRef.current = false;
    }

    recognitionRef.current = recognition;
    
    return () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }

  }, [language, options.wakeWord, options.onWakeWord, options.onSpeechEnd]);

  const startListening = useCallback((isPassive: boolean = false) => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      finalTranscriptRef.current = '';
      wakeWordTriggeredRef.current = !isPassive; // If not passive, assume wake word is active
      recognitionRef.current.start();
      setIsListening(true);
      isListeningRef.current = true;
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // onend will handle setting isListening to false
    }
  }, [isListening]);

  return { isListening, transcript, setTranscript, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognitionImpl };
};