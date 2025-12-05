'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';

interface CartPageClientProps {
  locale: string;
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // For now, redirect to checkout with first item
    // In a full implementation, you'd create a cart checkout endpoint
    if (items.length === 1) {
      router.push(`/${locale}/checkout?productId=${items[0].productId}&quantity=${items[0].quantity}`);
    } else {
      // Multiple items - you might want to create a cart checkout endpoint
      // For now, redirect to first item
      router.push(`/${locale}/checkout?productId=${items[0].productId}&quantity=${items[0].quantity}`);
    }
  };

  const texts = {
    ar: {
      title: 'سلة التسوق',
      empty: 'السلة فارغة',
      emptyMessage: 'لا توجد منتجات في السلة',
      continueShopping: 'متابعة التسوق',
      remove: 'إزالة',
      quantity: 'الكمية',
      subtotal: 'المجموع الفرعي',
      total: 'الإجمالي',
      checkout: 'إتمام الطلب',
      clearCart: 'مسح السلة',
    },
    en: {
      title: 'Shopping Cart',
      empty: 'Cart is empty',
      emptyMessage: 'No products in cart',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      quantity: 'Quantity',
      subtotal: 'Subtotal',
      total: 'Total',
      checkout: 'Checkout',
      clearCart: 'Clear Cart',
    },
    zh: {
      title: '购物车',
      empty: '购物车为空',
      emptyMessage: '购物车中没有商品',
      continueShopping: '继续购物',
      remove: '删除',
      quantity: '数量',
      subtotal: '小计',
      total: '总计',
      checkout: '结账',
      clearCart: '清空购物车',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState
            icon="🛒"
            title={t.empty}
            message={t.emptyMessage}
          />
          <div className="text-center mt-6">
            <Button
              variant="primary"
              onClick={() => router.push(`/${locale}/products`)}
            >
              {t.continueShopping}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <Button
            variant="secondary"
            onClick={clearCart}
            className="text-sm"
          >
            {t.clearCart}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-lg font-bold text-primary mb-3">
                    {formatCurrency(item.price, item.currency, locale)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">{t.quantity}:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {t.subtotal}: {formatCurrency(item.subtotal, item.currency, locale)}
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 hover:text-red-700 transition-colors self-start"
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
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">{t.total}:</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(total, items[0]?.currency || 'USD', locale)}
              </span>
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleCheckout}
            >
              {t.checkout}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

