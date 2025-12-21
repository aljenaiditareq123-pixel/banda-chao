'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Camera, Loader2, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  locale: string;
}


export default function SearchBar({ locale }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && isSpeechSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          setIsListening(false);
          // Auto-trigger search after voice input
          setTimeout(() => {
            if (transcript.trim()) {
              router.push(`/${locale}/products?search=${encodeURIComponent(transcript.trim())}`);
            }
          }, 100);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            alert(locale === 'ar' ? 'لم يتم اكتشاف أي كلام' : locale === 'zh' ? '未检测到语音' : 'No speech detected');
          } else if (event.error === 'not-allowed') {
            alert(locale === 'ar' ? 'السماح بالوصول إلى الميكروفون مطلوب' : locale === 'zh' ? '需要麦克风权限' : 'Microphone permission required');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [locale, isSpeechSupported, router]);

  const handleVoiceSearch = () => {
    if (!isSpeechSupported) {
      alert(locale === 'ar' ? 'ميزة البحث الصوتي غير مدعومة في متصفحك' : locale === 'zh' ? '您的浏览器不支持语音搜索' : 'Voice search is not supported in your browser');
      return;
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to start recognition:', error);
          setIsListening(false);
        }
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(locale === 'ar' ? 'يرجى اختيار صورة' : locale === 'zh' ? '请选择图片' : 'Please select an image');
      return;
    }

    // Show scanning animation
    setIsScanning(true);

    try {
      // Convert image to FormData
      const formData = new FormData();
      formData.append('image', file);

      // Call visual search API
      const response = await fetch('/api/search/visual', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const keywords = data.keywords || data.productName || 'منتج';

      // Redirect to search page with keywords
      setIsScanning(false);
      router.push(`/${locale}/products?search=${encodeURIComponent(keywords)}`);

    } catch (error) {
      console.error('Error in visual search:', error);
      setIsScanning(false);
      alert(locale === 'ar' ? 'حدث خطأ أثناء تحليل الصورة' : locale === 'zh' ? '分析图片时出错' : 'Error analyzing image');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const placeholder = {
    ar: 'ابحث عن منتجات...',
    en: 'Search for products...',
    zh: '搜索产品...',
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:block">
        <div className="relative">
          <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0' : 'left-0'} flex items-center pl-3 pr-3 pointer-events-none`}>
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder[locale as keyof typeof placeholder] || placeholder.en}
            className={`block w-full ${locale === 'ar' ? 'pr-28 pl-10' : 'pl-10 pr-28'} py-2.5 border-2 ${
              isFocused ? 'border-primary-500' : 'border-gray-300'
            } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
          />
          
          {/* Microphone Icon Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            disabled={!isSpeechSupported}
            className={`absolute inset-y-0 ${locale === 'ar' ? 'left-10' : 'right-10'} flex items-center pr-2 pl-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
              !isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={locale === 'ar' ? 'البحث بالصوت' : locale === 'zh' ? '语音搜索' : 'Voice search'}
            title={locale === 'ar' ? 'البحث بالصوت' : locale === 'zh' ? '语音搜索' : 'Voice search'}
          >
            <motion.div
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400'}`} />
            </motion.div>
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </button>

          {/* Camera Icon Button */}
          <button
            type="button"
            onClick={handleCameraClick}
            className={`absolute inset-y-0 ${locale === 'ar' ? 'left-20' : 'right-20'} flex items-center pr-2 pl-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors`}
            aria-label={locale === 'ar' ? 'البحث بالصورة' : locale === 'zh' ? '图片搜索' : 'Search by image'}
            title={locale === 'ar' ? 'البحث بالصورة' : locale === 'zh' ? '图片搜索' : 'Search by image'}
          >
            <Camera className="w-5 h-5 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" />
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={handleClear}
              className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0' : 'right-0'} flex items-center pr-3 pl-3`}
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </motion.button>
          )}
        </div>
      </form>

      {/* Scanning Overlay */}
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'جاري المسح...' : locale === 'zh' ? '正在扫描...' : 'Scanning...'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {locale === 'ar' 
                  ? 'نقوم بتحليل الصورة للعثور على منتجات مشابهة'
                  : locale === 'zh'
                  ? '正在分析图片以找到相似产品'
                  : 'Analyzing image to find similar products'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

    </>
  );
}
