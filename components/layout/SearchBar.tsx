'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Camera, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SimilarProductsModal from '@/components/search/SimilarProductsModal';

interface SearchBarProps {
  locale: string;
}

// Mock similar products for demonstration
const getMockSimilarProducts = () => [
  {
    id: '1',
    name: 'Fashion T-Shirt',
    price: 29.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Fashion',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Casual Shirt',
    price: 39.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1594938291221-94fa2b5b9943?w=400',
    category: 'Fashion',
    userId: 'user2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Designer Jacket',
    price: 89.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    category: 'Fashion',
    userId: 'user3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Summer Dress',
    price: 49.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Fashion',
    userId: 'user4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Classic Jeans',
    price: 59.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    category: 'Fashion',
    userId: 'user5',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function SearchBar({ locale }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showSimilarProducts, setShowSimilarProducts] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Create preview URL
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);

    // Show scanning animation
    setIsScanning(true);

    // Simulate AI analysis (mock - 2 seconds delay)
    setTimeout(() => {
      setIsScanning(false);
      setShowSimilarProducts(true);
    }, 2000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            className={`block w-full ${locale === 'ar' ? 'pr-20 pl-10' : 'pl-10 pr-20'} py-2.5 border-2 ${
              isFocused ? 'border-primary-500' : 'border-gray-300'
            } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all`}
          />
          
          {/* Camera Icon Button */}
          <button
            type="button"
            onClick={handleCameraClick}
            className={`absolute inset-y-0 ${locale === 'ar' ? 'left-10' : 'right-10'} flex items-center pr-2 pl-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors`}
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

      {/* Similar Products Modal */}
      <SimilarProductsModal
        isOpen={showSimilarProducts}
        onClose={() => {
          setShowSimilarProducts(false);
          if (uploadedImageUrl) {
            URL.revokeObjectURL(uploadedImageUrl);
            setUploadedImageUrl(null);
          }
        }}
        products={getMockSimilarProducts()}
        locale={locale}
        uploadedImageUrl={uploadedImageUrl || undefined}
      />
    </>
  );
}
