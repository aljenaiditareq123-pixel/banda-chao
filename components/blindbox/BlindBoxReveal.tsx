'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';

interface Product {
  id: string;
  name: string;
  name_ar?: string;
  name_zh?: string;
  description?: string;
  description_ar?: string;
  description_zh?: string;
  image_url?: string;
  price: number;
  currency?: string;
}

interface BlindBoxRevealProps {
  orderItemId: string;
  locale?: string;
  onRevealComplete?: (product: Product) => void;
}

export default function BlindBoxReveal({
  orderItemId,
  locale = 'en',
  onRevealComplete,
}: BlindBoxRevealProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedProduct, setRevealedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const translations = {
    ar: {
      title: '🎁 كشف الصندوق الغامض',
      revealButton: 'كشف الآن',
      revealing: 'جاري الكشف...',
      congratulations: 'مبروك!',
      youGot: 'لقد حصلت على',
      viewProduct: 'عرض المنتج',
      error: 'حدث خطأ أثناء الكشف',
      tryAgain: 'حاول مرة أخرى',
    },
    zh: {
      title: '🎁 揭开神秘盲盒',
      revealButton: '立即揭晓',
      revealing: '正在揭晓...',
      congratulations: '恭喜！',
      youGot: '你获得了',
      viewProduct: '查看产品',
      error: '揭晓时出错',
      tryAgain: '重试',
    },
    en: {
      title: '🎁 Reveal Mystery Box',
      revealButton: 'Reveal Now',
      revealing: 'Revealing...',
      congratulations: 'Congratulations!',
      youGot: 'You got',
      viewProduct: 'View Product',
      error: 'Error revealing box',
      tryAgain: 'Try Again',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const handleReveal = async () => {
    setIsRevealing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/blind-box/reveal/${orderItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t.error);
      }

      // Simulate reveal delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      setRevealedProduct(data.product);
      setShowConfetti(true);
      
      if (onRevealComplete) {
        onRevealComplete(data.product);
      }

      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setIsRevealing(false);
    }
  };

  // Generate confetti
  useEffect(() => {
    if (showConfetti) {
      const confettiCount = 100;
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FF69B4'];

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear forwards`;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
      }
    }
  }, [showConfetti]);

  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  const productName = revealedProduct 
    ? (locale === 'ar' ? revealedProduct.name_ar || revealedProduct.name
       : locale === 'zh' ? revealedProduct.name_zh || revealedProduct.name
       : revealedProduct.name)
    : '';

  return (
    <div className="w-full">
      {!revealedProduct ? (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 text-center border-2 border-purple-200 dark:border-purple-700">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
              <Gift className="w-16 h-16 text-white z-10" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-white/30 border-t-transparent rounded-full"
              />
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {locale === 'ar' 
              ? 'اضغط على الزر ليكشف ما بداخل الصندوق الغامض!'
              : locale === 'zh'
              ? '点击按钮揭开神秘盲盒的内容！'
              : 'Click the button to reveal what\'s inside the mystery box!'}
          </p>

          <Button
            variant="primary"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg"
            onClick={handleReveal}
            disabled={isRevealing}
          >
            {isRevealing ? (
              <>
                <Sparkles className="w-5 h-5 inline-block mr-2 animate-spin" />
                {t.revealing}
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 inline-block mr-2" />
                {t.revealButton}
              </>
            )}
          </Button>

          {error && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 text-center border-2 border-green-200 dark:border-green-700"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {t.congratulations}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-6"
          >
            {t.youGot}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6"
          >
            {revealedProduct.image_url ? (
              <img
                src={revealedProduct.image_url}
                alt={productName}
                className="w-48 h-48 mx-auto object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 text-6xl">
                🎁
              </div>
            )}
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {productName}
            </h4>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(revealedProduct.price, revealedProduct.currency || 'USD')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              variant="primary"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold px-8 py-3"
              onClick={() => {
                window.location.href = `/${locale}/products/${revealedProduct.id}`;
              }}
            >
              {t.viewProduct}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
