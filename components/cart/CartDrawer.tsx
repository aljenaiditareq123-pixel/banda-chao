'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import Button from '@/components/Button';
import Link from 'next/link';

interface CartDrawerProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ locale, isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  const formatPrice = (price: number, currency: string = 'AED') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const texts = {
    ar: {
      title: 'سلة التسوق',
      empty: 'سلة التسوق فارغة',
      emptyDesc: 'ابدأ التسوق لإضافة منتجات إلى سلة التسوق',
      continueShopping: 'متابعة التسوق',
      subtotal: 'المجموع الفرعي',
      total: 'المجموع الكلي',
      checkout: 'إتمام الشراء',
      remove: 'حذف',
    },
    en: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyDesc: 'Start shopping to add items to your cart',
      continueShopping: 'Continue Shopping',
      subtotal: 'Subtotal',
      total: 'Total',
      checkout: 'Checkout',
      remove: 'Remove',
    },
    zh: {
      title: '购物车',
      empty: '购物车是空的',
      emptyDesc: '开始购物，将商品添加到购物车',
      continueShopping: '继续购物',
      subtotal: '小计',
      total: '总计',
      checkout: '结账',
      remove: '删除',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: locale === 'ar' ? -400 : 400 }}
              animate={{ x: 0 }}
              exit={{ x: locale === 'ar' ? -400 : 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${locale === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col`}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  {t.title}
                  {itemCount > 0 && (
                    <span className="text-sm font-normal text-gray-500">
                      ({itemCount})
                    </span>
                  )}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.empty}</h3>
                    <p className="text-gray-500 mb-6">{t.emptyDesc}</p>
                    <Link href={`/${locale}/products`}>
                      <Button variant="primary" onClick={onClose}>
                        {t.continueShopping}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Product Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🛍️
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-red-600 mb-2">
                            {formatPrice(item.price, item.currency)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={t.remove}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <p className="text-sm text-gray-600 mt-2">
                            {t.subtotal}: <span className="font-semibold">{formatPrice(item.subtotal, item.currency)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">{t.total}:</span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(total, items[0]?.currency || 'AED')}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full min-h-[48px] text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    onClick={() => {
                      // TODO: Navigate to checkout page
                      console.log('Checkout clicked');
                    }}
                  >
                    {t.checkout}
                  </Button>
                  <Link href={`/${locale}/products`} className="block mt-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={onClose}
                    >
                      {t.continueShopping}
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
