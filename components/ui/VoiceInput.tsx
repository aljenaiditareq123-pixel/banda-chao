'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  lang?: 'ar-SA' | 'en-US' | 'zh-CN';
  disabled?: boolean;
  onTranscriptionStart?: () => void;
  onTranscriptionEnd?: () => void;
  onError?: (error: string) => void;
}

export default function VoiceInput({
  value,
  onChange,
  placeholder = 'اضغط على الميكروفون للتحدث أو اكتب هنا...',
  className = '',
  lang = 'ar-SA',
  disabled = false,
  onTranscriptionStart,
  onTranscriptionEnd,
  onError,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if Speech Recognition is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = lang;
          recognition.maxAlternatives = 1;

          recognition.onstart = () => {
            setIsListening(true);
            onTranscriptionStart?.();
          };

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
              onChange(transcript);
            }
          };

          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            onTranscriptionEnd?.();

            let errorMessage = 'حدث خطأ في التعرف على الصوت';
            switch (event.error) {
              case 'no-speech':
                errorMessage = 'لم يتم اكتشاف كلام. يرجى المحاولة مرة أخرى.';
                break;
              case 'audio-capture':
                errorMessage = 'لم يتم العثور على الميكروفون.';
                break;
              case 'not-allowed':
                errorMessage = 'تم رفض الوصول إلى الميكروفون.';
                break;
              case 'network':
                errorMessage = 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.';
                break;
              default:
                errorMessage = `خطأ: ${event.error}`;
            }
            onError?.(errorMessage);
          };

          recognition.onend = () => {
            setIsListening(false);
            onTranscriptionEnd?.();
          };

          recognitionRef.current = recognition;
        } catch (error) {
          console.error('Failed to initialize speech recognition:', error);
          setIsSupported(false);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [lang, onChange, onTranscriptionStart, onTranscriptionEnd, onError]);

  const toggleListening = () => {
    if (!isSupported || disabled) return;

    if (recognitionRef.current) {
      try {
        if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          recognitionRef.current.start();
        }
      } catch (error: any) {
        console.error('Failed to toggle recognition:', error);
        onError?.('فشل في بدء التسجيل. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent !text-black bg-white placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          dir={lang === 'ar-SA' ? 'rtl' : 'ltr'}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
              ${isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-primary-500 text-white hover:bg-primary-600'
              }
              disabled:bg-gray-300 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            `}
            title={isListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {isListening && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg animate-pulse">
          🎤 يستمع الآن...
        </div>
      )}
    </div>
  );
}
