'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchAPI } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce query for suggestions
  const debouncedQuery = useDebounce(query, 300);

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
    searchInputRef.current?.focus();
  };

  const placeholder = {
    ar: 'ابحث بذكاء... (مثال: شيء سريع للكتابة)',
    en: 'Search intelligently... (e.g., something fast for writing)',
    zh: '智能搜索... (例如：快速书写的东西)',
  };

  const showSuggestions = isOpen && (query.length > 0 || suggestions.length > 0 || popularSearches.length > 0 || recentSearches.length > 0);

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
            className={`block w-full ${locale === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-3 border-2 ${
              isOpen ? 'border-primary-500' : 'border-gray-300'
            } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm`}
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

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !isLoading && (
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
