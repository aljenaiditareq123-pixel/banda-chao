'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceInputButton({ onTranscript }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-SA'; // Arabic, can also use 'en-US' or 'zh-CN'

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          onTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            alert('لم أسمع أي صوت. يرجى المحاولة مرة أخرى.');
          } else if (event.error === 'not-allowed') {
            alert('يرجى السماح بالوصول إلى الميكروفون.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('خطأ في بدء التسجيل الصوتي. تأكد من السماح بالوصول إلى الميكروفون.');
      }
    } else {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg transition ${
        isListening
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={isListening ? 'اضغط لإيقاف التسجيل' : 'اضغط للتحدث'}
    >
      {isListening ? (
        <span className="text-xl">🛑</span>
      ) : (
        <span className="text-xl">🎤</span>
      )}
    </button>
  );
}


