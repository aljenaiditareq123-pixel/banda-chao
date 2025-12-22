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

  const toggleListening = async () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (error: any) {
          console.error('Failed to stop recognition:', error);
        }
      }
      return;
    }

    // Request microphone permission before starting
    try {
      // Request permission using getUserMedia (more reliable)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Now start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error: any) {
          console.error('Failed to start recognition:', error);
          onError?.('فشل في بدء التسجيل. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (error: any) {
      console.error('Microphone permission denied:', error);
      let errorMessage = 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'لم يتم العثور على ميكروفون. يرجى التأكد من وجود ميكروفون متصل.';
      }
      onError?.(errorMessage);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent !text-black bg-white placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            lang === 'ar-SA' ? 'px-4 pr-12' : 'px-4 pl-12'
          }`}
          dir={lang === 'ar-SA' ? 'rtl' : 'ltr'}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`
              absolute top-1/2 -translate-y-1/2 ${lang === 'ar-SA' ? 'left-2' : 'right-2'}
              z-50 flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer
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
        <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg animate-pulse z-50">
          🎤 يستمع الآن...
        </div>
      )}
    </div>
  );
}
