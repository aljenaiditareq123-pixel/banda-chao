'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/lib/formatCurrency';

interface CartPageClientProps {
  locale: string;
}

export default function CartPageClient({ locale }: CartPageClientProps) {
  const { items, removeItem, updateQuantity, total, clearCart, itemCount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push(`/${locale}/checkout`);
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const currentItem = items.find((item) => item.productId === productId);
    if (currentItem) {
      const newQuantity = Math.max(1, currentItem.quantity + change);
      updateQuantity(productId, newQuantity);
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
      checkout: 'إتمام الشراء',
      clearCart: 'مسح السلة',
      price: 'السعر',
      product: 'المنتج',
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
      checkout: 'Proceed to Checkout',
      clearCart: 'Clear Cart',
      price: 'Price',
      product: 'Product',
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
      checkout: '前往结账',
      clearCart: '清空购物车',
      price: '价格',
      product: '产品',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t.title} {itemCount > 0 && `(${itemCount})`}
          </h1>
          {items.length > 0 && (
            <Button
              variant="secondary"
              onClick={clearCart}
              className="text-sm"
            >
              {t.clearCart}
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items - Desktop Table View */}
          <div className="lg:w-3/4">
            <Card className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                        {t.product}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.price}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.quantity}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t.subtotal}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        {t.remove}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const placeholder = target.nextElementSibling as HTMLElement;
                                    if (placeholder) {
                                      placeholder.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full flex items-center justify-center text-xl" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                                🛍️
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/${locale}/products/${item.productId}`}
                                className="text-sm font-medium text-gray-900 hover:text-primary transition-colors block truncate"
                              >
                                {item.name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(item.price, item.currency, locale)}
                        </td>
                        {/* Quantity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, -1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                            >
                              −
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        {/* Subtotal */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                          {formatCurrency(item.subtotal, item.currency, locale)}
                        </td>
                        {/* Remove */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-xl" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                          🛍️
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/${locale}/products/${item.productId}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary transition-colors block mb-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-lg font-bold text-primary mb-3">
                          {formatCurrency(item.price, item.currency, locale)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, -1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              −
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, 1)}
                              className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {t.subtotal}: <span className="font-semibold text-primary">{formatCurrency(item.subtotal, item.currency, locale)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Cart Summary */}
          <div className="lg:w-1/4">
            <Card className="sticky top-4">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
                  {t.total}
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t.subtotal}:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(total, items[0]?.currency || 'USD', locale)}
                    </span>
                  </div>
                  {/* Shipping and taxes can be added here later */}
                </div>
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{t.total}:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(total, items[0]?.currency || 'USD', locale)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full mb-3"
                  onClick={handleCheckout}
                >
                  {t.checkout}
                </Button>
                <Link
                  href={`/${locale}/products`}
                  className="block w-full text-center py-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {t.continueShopping}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

