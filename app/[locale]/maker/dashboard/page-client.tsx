'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { makersAPI, productsAPI, videosAPI, ordersAPI } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/formatCurrency';

interface MakerDashboardClientProps {
  locale: string;
}

type Tab = 'overview' | 'products' | 'videos' | 'profile';

export default function MakerDashboardClient({ locale }: MakerDashboardClientProps) {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [maker, setMaker] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVideos: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login or maker join
      window.location.href = `/${locale}/maker/join`;
      return;
    }

    if (user && user.role !== 'MAKER') {
      // Redirect to maker join if not a maker
      window.location.href = `/${locale}/maker/join`;
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, locale]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [makerRes, productsRes, videosRes, ordersRes] = await Promise.all([
        makersAPI.getMe().catch(() => ({ success: false })),
        makersAPI.getMeProducts().catch(() => ({ success: false, products: [] })),
        makersAPI.getMeVideos().catch(() => ({ success: false, videos: [] })),
        ordersAPI.getMyOrders().catch(() => ({ success: false, orders: [] })),
      ]);

      if (!makerRes.success || !makerRes.maker) {
        setError('Maker profile not found. Please complete onboarding.');
        return;
      }

      setMaker(makerRes.maker);
      setProducts(productsRes.products || []);
      setVideos(videosRes.videos || []);
      setOrders(ordersRes.orders || []);

      // Calculate stats
      const totalEarnings = (ordersRes.orders || []).reduce((sum: number, order: any) => {
        if (order.status === 'PAID') {
          return sum + (order.makerRevenue || order.totalPrice * 0.9); // 90% to maker (10% commission)
        }
        return sum;
      }, 0);

      setStats({
        totalProducts: makerRes.maker._count?.products || 0,
        totalVideos: makerRes.maker._count?.videos || 0,
        totalOrders: ordersRes.orders?.length || 0,
        totalEarnings,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <LoadingState fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <ErrorState message={error} fullScreen />
      </div>
    );
  }

  if (!maker) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">
            {locale === 'ar' ? 'لم يتم العثور على ملف الصانع' : 'Maker profile not found'}
          </p>
          <Link href={`/${locale}/maker/join`}>
            <Button variant="primary">انضم كصانع</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: locale === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'products' as Tab, label: locale === 'ar' ? 'المنتجات' : 'Products' },
    { id: 'videos' as Tab, label: locale === 'ar' ? 'الفيديوهات' : 'Videos' },
    { id: 'profile' as Tab, label: locale === 'ar' ? 'الملف الشخصي' : 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'لوحة تحكم الصانع' : 'Maker Dashboard'}
          </h1>
          <p className="text-gray-600">
            {locale === 'ar' ? `مرحباً، ${maker.displayName}` : `Welcome, ${maker.displayName}`}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {locale === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </Card>
              <Card>
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {locale === 'ar' ? 'إجمالي الفيديوهات' : 'Total Videos'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalVideos}</p>
                </div>
              </Card>
              <Card>
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    {locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="p-6">
                  <p className="text-sm font-medium text-green-700 mb-2">
                    {locale === 'ar' ? 'أرباحي' : 'My Earnings'}
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {formatCurrency(stats.totalEarnings, 'USD', locale)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {locale === 'ar' ? 'تقديري' : 'Estimated'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {locale === 'ar' ? 'الطلبات الأخيرة' : 'Recent Orders'}
                </h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">
                    {locale === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(order.totalPrice, order.currency || 'USD', locale)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {locale === 'ar' ? 'منتجاتي' : 'My Products'}
              </h2>
              <Button variant="primary">
                {locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
              </Button>
            </div>
            {products.length === 0 ? (
              <Card>
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    {locale === 'ar' ? 'لا توجد منتجات بعد' : 'No products yet'}
                  </p>
                  <Button variant="primary">
                    {locale === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product.id}>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{product.description?.slice(0, 100)}...</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.price, product.currency || 'USD', locale)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="text" className="text-sm">
                          {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button variant="text" className="text-sm">
                          {product.status === 'PUBLISHED' ? (locale === 'ar' ? 'إخفاء' : 'Hide') : (locale === 'ar' ? 'نشر' : 'Publish')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {locale === 'ar' ? 'فيديوهاتي' : 'My Videos'}
              </h2>
              <Button variant="primary">
                {locale === 'ar' ? 'إضافة فيديو جديد' : 'Add New Video'}
              </Button>
            </div>
            {videos.length === 0 ? (
              <Card>
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">
                    {locale === 'ar' ? 'لا توجد فيديوهات بعد' : 'No videos yet'}
                  </p>
                  <Button variant="primary">
                    {locale === 'ar' ? 'إضافة فيديو جديد' : 'Add New Video'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any) => (
                  <Card key={video.id}>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 mb-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{video.description?.slice(0, 100)}...</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{video.viewsCount || 0} {locale === 'ar' ? 'مشاهدة' : 'views'}</span>
                        <Button variant="text" className="text-sm">
                          {locale === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'الاسم المعروض' : 'Display Name'}
                  </label>
                  <input
                    type="text"
                    defaultValue={maker.displayName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'نبذة' : 'Bio'}
                  </label>
                  <textarea
                    defaultValue={maker.bio}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'البلد' : 'Country'}
                    </label>
                    <input
                      type="text"
                      defaultValue={maker.country || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'المدينة' : 'City'}
                    </label>
                    <input
                      type="text"
                      defaultValue={maker.city || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {locale === 'ar' ? 'المنطقة الزمنية' : 'Time Zone'}
                  </label>
                  <input
                    type="text"
                    defaultValue={maker.timeZone || ''}
                    placeholder={locale === 'ar' ? 'مثال: Asia/Dubai' : 'e.g., Asia/Dubai'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <Button variant="primary" className="mt-4">
                  {locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

