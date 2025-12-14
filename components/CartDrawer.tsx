'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/formatCurrency';

interface CartDrawerProps {
  locale: string;
}

const texts = {
  ar: {
    cartTitle: 'سلة التسوق',
    subtotal: 'المجموع الفرعي',
    viewCart: 'عرض السلة بالكامل',
    checkout: 'إتمام الشراء',
    emptyCart: 'سلتك فارغة.',
    remove: 'إزالة',
    quantity: 'الكمية',
  },
  en: {
    cartTitle: 'Shopping Cart',
    subtotal: 'Subtotal',
    viewCart: 'View Full Cart',
    checkout: 'Proceed to Checkout',
    emptyCart: 'Your cart is empty.',
    remove: 'Remove',
    quantity: 'Quantity',
  },
  zh: {
    cartTitle: '购物车',
    subtotal: '小计',
    viewCart: '查看完整购物车',
    checkout: '结账',
    emptyCart: '您的购物车是空的。',
    remove: '删除',
    quantity: '数量',
  },
};

export default function CartDrawer({ locale }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total, itemCount, isDrawerOpen = false, toggleDrawer } = useCart();

  const t = texts[locale as keyof typeof texts] || texts.en;

  // Close drawer when clicking outside
  const handleOverlayClick = () => {
    if (toggleDrawer) {
      toggleDrawer();
    }
  };

  // Update quantity handler
  const handleQuantityChange = (productId: string, change: number) => {
    const currentItem = items.find((item) => item.productId === productId);
    if (currentItem) {
      const newQuantity = Math.max(1, currentItem.quantity + change);
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[99]"
            onClick={handleOverlayClick}
            aria-hidden={!isDrawerOpen}
          />

          {/* Drawer - Enhanced with framer-motion */}
          <motion.div
            initial={{ x: locale === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: locale === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed ${locale === 'ar' ? 'right-0' : 'left-0'} top-0 w-full md:w-96 h-full bg-white dark:bg-gray-800 shadow-xl z-[100]`}
            role="dialog"
            aria-modal="true"
            aria-label={t.cartTitle}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.cartTitle} ({itemCount})
            </h2>
            <button
              onClick={toggleDrawer}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={locale === 'ar' ? 'إغلاق السلة' : locale === 'zh' ? '关闭购物车' : 'Close cart'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-10">{t.emptyCart}</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 border-b border-gray-100 dark:border-gray-700 pb-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    {item.isBlindBox ? (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-purple-400 to-pink-500">
                        📦
                      </div>
                    ) : item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <Link
                      href={item.isBlindBox ? '#' : `/${locale}/products/${item.productId}`}
                      onClick={item.isBlindBox ? (e) => e.preventDefault() : toggleDrawer}
                      className="text-base font-medium text-gray-900 dark:text-white hover:text-primary transition-colors block truncate"
                    >
                      {item.isBlindBox 
                        ? (locale === 'ar' ? '📦 صندوق غامض' : locale === 'zh' ? '📦 神秘盲盒' : '📦 Mystery Box')
                        : item.name}
                    </Link>
                    {item.isBlindBox && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {locale === 'ar' ? 'سيتم الكشف بعد الدفع' : locale === 'zh' ? '付款后揭晓' : 'Revealed after payment'}
                      </p>
                    )}
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatCurrency(item.subtotal, item.currency || 'USD', locale)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        disabled={item.quantity <= 1}
                        className="text-gray-600 dark:text-gray-300 hover:text-primary disabled:opacity-50 border border-gray-300 dark:border-gray-600 w-6 h-6 rounded flex items-center justify-center text-lg leading-none transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        className="text-gray-600 dark:text-gray-300 hover:text-primary border border-gray-300 dark:border-gray-600 w-6 h-6 rounded flex items-center justify-center text-lg leading-none transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex-shrink-0 text-sm text-red-500 hover:text-red-700 pt-1 transition-colors"
                    title={t.remove}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span className="text-gray-900 dark:text-white">{t.subtotal}:</span>
                <span className="text-2xl text-primary">
                  {formatCurrency(total, items[0]?.currency || 'USD', locale)}
                </span>
              </div>
              <Link
                href={`/${locale}/checkout`}
                onClick={toggleDrawer}
                className="w-full block text-center py-3 rounded-lg font-semibold transition duration-150 mb-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
              >
                {t.checkout}
              </Link>
              <Link
                href={`/${locale}/cart`}
                onClick={toggleDrawer}
                className="w-full block text-center py-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t.viewCart}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

