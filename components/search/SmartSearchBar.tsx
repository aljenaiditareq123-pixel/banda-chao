'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, TrendingUp, Clock, Camera, Sparkles, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAPI } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';

interface SmartSearchBarProps {
  locale: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SmartSearchBar({ locale, className = '', onSearch }: SmartSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Debounce query for suggestions
  const debouncedQuery = useDebounce(query, 300);

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
          setQuery(transcript);
          setIsListening(false);
          // Auto-trigger search after voice input
          setTimeout(() => {
            handleSearch(transcript);
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
  }, [locale, isSpeechSupported]);

  // Load popular searches on mount
  useEffect(() => {
    loadPopularSearches();
    loadRecentSearches();
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, locale]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPopularSearches = async () => {
    try {
      const result = await searchAPI.getPopular(10);
      if (result.success && result.searches) {
        setPopularSearches(result.searches);
      }
    } catch (error) {
      console.error('Failed to load popular searches:', error);
    }
  };

  const loadRecentSearches = () => {
    if (typeof window !== 'undefined') {
      const recent = localStorage.getItem('recent_searches');
      if (recent) {
        try {
          setRecentSearches(JSON.parse(recent));
        } catch (error) {
          console.error('Failed to parse recent searches:', error);
        }
      }
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    if (typeof window !== 'undefined') {
      const recent = recentSearches.filter(s => s !== searchQuery);
      const updated = [searchQuery, ...recent].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const result = await searchAPI.getSuggestions(searchQuery, locale);
      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    saveRecentSearch(searchQuery.trim());
    setIsOpen(false);
    
    if (onSearch) {
      onSearch(searchQuery.trim());
    } else {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSimilarProducts([]);
    setShowSimilarProducts(false);
    searchInputRef.current?.focus();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image file
    if (!file.type.startsWith('image/')) {
      alert(locale === 'ar' ? 'يرجى اختيار ملف صورة' : locale === 'zh' ? '请选择图片文件' : 'Please select an image file');
      return;
    }

    // Show scanning state
    setIsScanning(true);
    setShowSimilarProducts(false);
    setSimilarProducts([]);
    setIsOpen(true);

    // Simulate scanning for 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      
      // Mock similar products data
      const mockProducts = [
        {
          id: '1',
          name: locale === 'ar' ? 'منتج مشابه 1' : locale === 'zh' ? '相似产品 1' : 'Similar Product 1',
          imageUrl: 'https://via.placeholder.com/300x300?text=Product+1',
          price: 99.99,
          currency: 'USD',
          description: locale === 'ar' ? 'وصف المنتج المشابه' : locale === 'zh' ? '相似产品描述' : 'Similar product description',
        },
        {
          id: '2',
          name: locale === 'ar' ? 'منتج مشابه 2' : locale === 'zh' ? '相似产品 2' : 'Similar Product 2',
          imageUrl: 'https://via.placeholder.com/300x300?text=Product+2',
          price: 149.99,
          currency: 'USD',
          description: locale === 'ar' ? 'وصف المنتج المشابه' : locale === 'zh' ? '相似产品描述' : 'Similar product description',
        },
        {
          id: '3',
          name: locale === 'ar' ? 'منتج مشابه 3' : locale === 'zh' ? '相似产品 3' : 'Similar Product 3',
          imageUrl: 'https://via.placeholder.com/300x300?text=Product+3',
          price: 79.99,
          currency: 'USD',
          description: locale === 'ar' ? 'وصف المنتج المشابه' : locale === 'zh' ? '相似产品描述' : 'Similar product description',
        },
        {
          id: '4',
          name: locale === 'ar' ? 'منتج مشابه 4' : locale === 'zh' ? '相似产品 4' : 'Similar Product 4',
          imageUrl: 'https://via.placeholder.com/300x300?text=Product+4',
          price: 199.99,
          currency: 'USD',
          description: locale === 'ar' ? 'وصف المنتج المشابه' : locale === 'zh' ? '相似产品描述' : 'Similar product description',
        },
      ];

      setSimilarProducts(mockProducts);
      setShowSimilarProducts(true);
    }, 2000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

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

  const placeholder = {
    ar: 'ابحث بذكاء... (مثال: شيء سريع للكتابة)',
    en: 'Search intelligently... (e.g., something fast for writing)',
    zh: '智能搜索... (例如：快速书写的东西)',
  };

  const showSuggestions = isOpen && (query.length > 0 || suggestions.length > 0 || popularSearches.length > 0 || recentSearches.length > 0 || isScanning || showSimilarProducts);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <div className="relative">
          <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0' : 'left-0'} flex items-center pl-3 pr-3 pointer-events-none z-10`}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder[locale as keyof typeof placeholder] || placeholder.en}
            className={`block w-full ${locale === 'ar' ? 'pr-28 pl-10' : 'pl-12 pr-28'} py-3 border-2 ${
              isOpen ? 'border-primary-500' : 'border-gray-300'
            } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm`}
          />
          {/* Microphone Icon Button */}
          <motion.button
            type="button"
            onClick={handleVoiceSearch}
            disabled={!isSpeechSupported}
            className={`absolute inset-y-0 ${locale === 'ar' ? 'left-10' : 'right-10'} flex items-center pr-2 pl-2 z-10 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors relative ${
              !isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={locale === 'ar' ? 'البحث بالصوت' : locale === 'zh' ? '语音搜索' : 'Voice search'}
            title={locale === 'ar' ? 'البحث بالصوت' : locale === 'zh' ? '语音搜索' : 'Voice search'}
          >
            <motion.div
              animate={isListening ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-400 hover:text-primary-500'}`} />
            </motion.div>
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
          {/* Camera Icon Button */}
          <motion.button
            type="button"
            onClick={handleCameraClick}
            className={`absolute inset-y-0 ${locale === 'ar' ? 'left-20' : 'right-20'} flex items-center pr-2 pl-2 z-10 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors`}
            aria-label={locale === 'ar' ? 'البحث بالصورة' : locale === 'zh' ? '图片搜索' : 'Search by image'}
          >
            <Camera className="w-5 h-5 text-gray-400 hover:text-primary-500 transition-colors" />
          </motion.button>
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={handleClear}
              className={`absolute inset-y-0 ${locale === 'ar' ? 'left-0' : 'right-0'} flex items-center pr-3 pl-3 z-10`}
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </motion.button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto"
          >
            {/* Query Suggestions */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  {locale === 'ar' ? 'اقتراحات' : locale === 'zh' ? '建议' : 'Suggestions'}
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {locale === 'ar' ? 'البحث الأخير' : locale === 'zh' ? '最近搜索' : 'Recent Searches'}
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {query.length === 0 && popularSearches.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {locale === 'ar' ? 'الأكثر بحثاً' : locale === 'zh' ? '热门搜索' : 'Popular Searches'}
                </div>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Scanning State */}
            {isScanning && (
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="w-12 h-12 text-primary-500" />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  {locale === 'ar' ? 'جارٍ المسح...' : locale === 'zh' ? '正在扫描...' : 'Scanning...'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {locale === 'ar' ? 'جاري البحث عن منتجات مشابهة' : locale === 'zh' ? '正在查找相似产品' : 'Finding similar products'}
                </p>
              </div>
            )}

            {/* Similar Products Results */}
            {showSimilarProducts && similarProducts.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4" />
                  {locale === 'ar' ? 'منتجات مشابهة' : locale === 'zh' ? '相似产品' : 'Similar Products'}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {similarProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.id}`}
                      className="block bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {product.name}
                        </h4>
                        <p className="text-xs font-bold text-primary-500">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && !isScanning && !showSimilarProducts && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {locale === 'ar' ? 'لا توجد اقتراحات' : locale === 'zh' ? '没有建议' : 'No suggestions'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
