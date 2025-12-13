'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  locale: string;
}

export default function SearchBar({ locale }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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

  const placeholder = {
    ar: 'ابحث عن منتجات...',
    en: 'Search for products...',
    zh: '搜索产品...',
  };

  return (
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
          className={`block w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border-2 ${
            isFocused ? 'border-primary-500' : 'border-gray-300'
          } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
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
  );
}
