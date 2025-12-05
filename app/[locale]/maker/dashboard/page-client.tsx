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
import VideoRecorder from '@/components/maker/VideoRecorder';
import AddProductForm from '@/components/maker/AddProductForm';

interface MakerDashboardClientProps {
  locale: string;
}

type Tab = 'overview' | 'products' | 'videos' | 'profile';

interface Maker {
  id?: string;
  displayName?: string;
  name?: string;
  bio?: string;
  country?: string;
  city?: string;
  timeZone?: string;
  languages?: string[];
  socialLinks?: Record<string, string>;
  wechatLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  facebookLink?: string;
  paypalLink?: string;
  phone?: string;
}

interface ProfileFormProps {
  maker: Maker;
  locale: string;
  onSave: () => void;
}

function ProfileForm({ maker, locale, onSave }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(maker.displayName || maker.name || '');
  const [bio, setBio] = useState(maker.bio || '');
  const [country, setCountry] = useState(maker.country || '');
  const [city, setCity] = useState(maker.city || '');
  const [timeZone, setTimeZone] = useState(maker.timeZone || '');
  const [wechatLink, setWechatLink] = useState(maker.wechatLink || '');
  const [instagramLink, setInstagramLink] = useState(maker.instagramLink || '');
  const [twitterLink, setTwitterLink] = useState(maker.twitterLink || '');
  const [facebookLink, setFacebookLink] = useState(maker.facebookLink || '');
  const [paypalLink, setPaypalLink] = useState(maker.paypalLink || '');
  const [phone, setPhone] = useState(maker.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await makersAPI.createOrUpdate({
        displayName,
        bio,
        country,
        city,
        languages: maker.languages || [],
        socialLinks: maker.socialLinks || {},
        wechatLink: wechatLink || undefined,
        instagramLink: instagramLink || undefined,
        twitterLink: twitterLink || undefined,
        facebookLink: facebookLink || undefined,
        paypalLink: paypalLink || undefined,
        phone: phone || undefined,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSave();
        }, 1500);
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل حفظ التغييرات' : 'Failed to save changes'));
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            {locale === 'ar' ? 'تم حفظ التغييرات بنجاح' : locale === 'zh' ? '保存成功' : 'Changes saved successfully'}
          </p>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'ar' ? 'الاسم المعروض' : 'Display Name'}
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'ar' ? 'نبذة' : 'Bio'}
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
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
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'المدينة' : 'City'}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          placeholder={locale === 'ar' ? 'مثال: Asia/Dubai' : 'e.g., Asia/Dubai'}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Social Links Section */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {locale === 'ar' ? 'وسائل التواصل' : locale === 'zh' ? '社交媒体' : 'Social Media & Contact'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'WeChat' : 'WeChat'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="url"
              value={wechatLink}
              onChange={(e) => setWechatLink(e.target.value)}
              placeholder={locale === 'ar' ? 'رابط WeChat أو رقم الهاتف' : 'WeChat link or phone number'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'Instagram' : 'Instagram'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="url"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'Twitter/X' : 'Twitter/X'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="url"
              value={twitterLink}
              onChange={(e) => setTwitterLink(e.target.value)}
              placeholder="https://twitter.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'Facebook' : 'Facebook'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="url"
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'PayPal' : 'PayPal'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="url"
              value={paypalLink}
              onChange={(e) => setPaypalLink(e.target.value)}
              placeholder="https://paypal.me/..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ar' ? 'رقم الهاتف' : locale === 'zh' ? '电话号码' : 'Phone Number'} {locale === 'ar' ? '(اختياري)' : '(optional)'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={locale === 'ar' ? '+971 50 123 4567' : '+971 50 123 4567'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <Button 
        variant="primary" 
        className="mt-4"
        onClick={handleSave}
        disabled={saving}
      >
        {saving 
          ? (locale === 'ar' ? 'جاري الحفظ...' : locale === 'zh' ? '保存中...' : 'Saving...')
          : (locale === 'ar' ? 'حفظ التغييرات' : locale === 'zh' ? '保存更改' : 'Save Changes')}
      </Button>
    </div>
  );
}

export default function MakerDashboardClient({ locale }: MakerDashboardClientProps) {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [maker, setMaker] = useState<Maker | null>(null);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    status?: string;
    images?: Array<{ url: string }>;
    imageUrl?: string;
  }>>([]);
  const [videos, setVideos] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    viewsCount?: number;
    type?: string;
  }>>([]);
  const [orders, setOrders] = useState<Array<{
    id: string;
    totalPrice: number;
    currency?: string;
    status: string;
    makerRevenue?: number;
  }>>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVideos: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoRecorder, setShowVideoRecorder] = useState<{ show: boolean; type?: 'SHORT' | 'LONG' }>({ show: false });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: string;
    name: string;
    description: string;
    price?: number;
    category?: string;
    image_url?: string;
    external_link?: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = `/${locale}/auth/login`;
        return;
      }

      if (user.role !== 'MAKER') {
        // Redirect to maker join if not a maker
        window.location.href = `/${locale}/maker/join`;
        return;
      }

      // User is authenticated and is a maker
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

      if (!makerRes.success || !('maker' in makerRes) || !makerRes.maker) {
        setError('Maker profile not found. Please complete onboarding.');
        return;
      }

      setMaker(makerRes.maker);
      setProducts(productsRes.products || []);
      setVideos(videosRes.videos || []);
      setOrders(ordersRes.orders || []);

      // Calculate stats
      const totalEarnings = (ordersRes.orders || []).reduce((sum: number, order: { status: string; makerRevenue?: number; totalPrice?: number }) => {
        if (order.status === 'PAID') {
          return sum + (order.makerRevenue || (order.totalPrice || 0) * 0.9); // 90% to maker (10% commission)
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
                    {orders.slice(0, 5).map((order) => (
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
              <Button 
                variant="primary"
                onClick={() => {
                  setEditingProduct(null);
                  setShowAddProductForm(true);
                }}
              >
                {locale === 'ar' ? 'إضافة منتج جديد' : locale === 'zh' ? '添加新产品' : 'Add New Product'}
              </Button>
            </div>
            {products.length === 0 ? (
              <Card>
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {locale === 'ar' ? 'لا توجد منتجات بعد' : locale === 'zh' ? '还没有产品' : 'No products yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {locale === 'ar' 
                      ? 'ابدأ بإنشاء منتجك الأول لعرضه للمشترين حول العالم'
                      : locale === 'zh'
                      ? '创建您的第一个产品，向全球买家展示'
                      : 'Start by creating your first product to showcase to buyers worldwide'}
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setEditingProduct(null);
                      setShowAddProductForm(true);
                    }}
                  >
                    {locale === 'ar' ? 'إضافة منتج جديد' : locale === 'zh' ? '添加新产品' : 'Add New Product'}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
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
                        <Button 
                          variant="text" 
                          className="text-sm"
                          onClick={() => {
                            setEditingProduct({
                              id: product.id,
                              name: product.name,
                              description: product.description || '',
                              price: product.price,
                              category: (product as { category?: string }).category,
                              image_url: product.images?.[0]?.url || product.imageUrl,
                              external_link: '',
                            });
                            setShowAddProductForm(true);
                          }}
                        >
                          {locale === 'ar' ? 'تعديل' : locale === 'zh' ? '编辑' : 'Edit'}
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
            {showVideoRecorder.show && showVideoRecorder.type && (
              <VideoRecorder
                locale={locale}
                type={showVideoRecorder.type}
                onSuccess={() => {
                  setShowVideoRecorder({ show: false });
                  fetchDashboardData();
                }}
                onCancel={() => setShowVideoRecorder({ show: false })}
              />
            )}
            {!showVideoRecorder.show && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {locale === 'ar' ? 'فيديوهاتي' : 'My Videos'}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => setShowVideoRecorder({ show: true, type: 'SHORT' })}
                    >
                      {locale === 'ar' ? 'فيديو قصير' : 'Short Video'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowVideoRecorder({ show: true, type: 'LONG' })}
                    >
                      {locale === 'ar' ? 'فيديو طويل' : 'Long Video'}
                    </Button>
                  </div>
                </div>
                {videos.length === 0 ? (
              <Card>
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {locale === 'ar' ? 'لا توجد فيديوهات بعد' : locale === 'zh' ? '还没有视频' : 'No videos yet'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {locale === 'ar' 
                      ? 'شارك قصتك ومنتجاتك مع المشترين من خلال الفيديو'
                      : locale === 'zh'
                      ? '通过视频与买家分享您的故事和产品'
                      : 'Share your story and products with buyers through video'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => setShowVideoRecorder({ show: true, type: 'SHORT' })}
                    >
                      {locale === 'ar' ? 'فيديو قصير' : locale === 'zh' ? '短视频' : 'Short Video'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowVideoRecorder({ show: true, type: 'LONG' })}
                    >
                      {locale === 'ar' ? 'فيديو طويل' : locale === 'zh' ? '长视频' : 'Long Video'}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
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
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
              </h2>
              <ProfileForm maker={maker} locale={locale} onSave={fetchDashboardData} />
            </div>
          </Card>
        )}
      </div>

      {/* Add Product Form Modal */}
      {showAddProductForm && (
        <AddProductForm
          locale={locale}
          product={editingProduct}
          onSuccess={() => {
            setShowAddProductForm(false);
            setEditingProduct(null);
            fetchDashboardData();
          }}
          onCancel={() => {
            setShowAddProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}


