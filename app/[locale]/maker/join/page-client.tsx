'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { makersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
=======
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)

interface MakerJoinClientProps {
  locale: string;
}

export default function MakerJoinClient({ locale }: MakerJoinClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    country: '',
    city: '',
    languages: ['ar', 'en'] as string[],
    categories: [] as string[],
  });

  // Check localStorage for auth state (consistent with navbar)
  const [localAuthState, setLocalAuthState] = useState<{
    isLoggedIn: boolean;
    hasToken: boolean;
  }>({ isLoggedIn: false, hasToken: false });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('bandaChao_isLoggedIn') === 'true';
      const hasToken = !!localStorage.getItem('auth_token');
      setLocalAuthState({ isLoggedIn, hasToken });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check both user from API and localStorage for consistency
    const isAuthenticated = user || localAuthState.isLoggedIn || localAuthState.hasToken;
    
    if (!isAuthenticated) {
      setError(locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      router.push(`/${locale}/login`);
      return;
    }

    if (!formData.displayName || !formData.bio) {
      setError(locale === 'ar' ? 'الاسم والنبذة مطلوبان' : 'Display name and bio are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await makersAPI.createOrUpdate(formData);

      if (response.maker) {
        // Update user role to MAKER in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bandaChao_userRole', 'MAKER');
          if (process.env.NODE_ENV === 'development') {
            console.log('[MakerJoin] User role updated to MAKER');
          }
        }
        router.push(`/${locale}/maker/dashboard`);
      } else {
        setError(response.message || (locale === 'ar' ? 'فشل إنشاء الملف' : 'Failed to create profile'));
      }
    } catch (err: any) {
      console.error('Error onboarding:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
=======
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  useEffect(() => {
    // If user is already a maker, redirect to dashboard
    if (!authLoading && user && user.role === 'MAKER') {
      router.push(`/${locale}/maker/dashboard`);
    }
  }, [user, authLoading, locale, router]);

  const handleBecomeSeller = async () => {
    setIsUpgrading(true);
    
    try {
      // Mock API call to upgrade user to MAKER role
      // In production, this would call: await usersAPI.upgradeToMaker()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local storage
      if (user) {
        const updatedUser = { ...user, role: 'MAKER' };
        localStorage.setItem('bandaChao_user', JSON.stringify(updatedUser));
        localStorage.setItem('bandaChao_userRole', 'MAKER');
      }
      
      setUpgradeSuccess(true);
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push(`/${locale}/maker/dashboard`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error upgrading to maker:', error);
      setIsUpgrading(false);
    }
  };

  const texts = {
    ar: {
      title: 'كن صانعاً على Banda Chao',
      subtitle: 'انضم إلى مجتمع الحرفيين المستقلين',
      becomeSeller: 'كن بائعاً الآن',
      alreadyMaker: 'أنت بالفعل صانع!',
      redirecting: 'جاري التوجيه...',
      benefits: [
        'رفع منتجاتك بلا حدود',
        'إدارة متجرك الخاص',
        'ربط مباشر مع العملاء',
        'عمولات تنافسية',
      ],
      upgrading: 'جاري الترقية...',
      success: 'تم الترقية بنجاح!',
    },
    en: {
      title: 'Become a Maker on Banda Chao',
      subtitle: 'Join our community of independent artisans',
      becomeSeller: 'Become a Seller Now',
      alreadyMaker: 'You are already a Maker!',
      redirecting: 'Redirecting...',
      benefits: [
        'Upload unlimited products',
        'Manage your own store',
        'Direct connection with customers',
        'Competitive commissions',
      ],
      upgrading: 'Upgrading...',
      success: 'Upgrade Successful!',
    },
    zh: {
      title: '成为 Banda Chao 手工艺人',
      subtitle: '加入我们的独立手工艺人社区',
      becomeSeller: '立即成为卖家',
      alreadyMaker: '您已经是手工艺人了！',
      redirecting: '正在重定向...',
      benefits: [
        '无限上传产品',
        '管理您自己的商店',
        '与客户直接联系',
        '有竞争力的佣金',
      ],
      upgrading: '正在升级...',
      success: '升级成功！',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
        <LoadingState fullScreen />
      </div>
    );
  }

<<<<<<< HEAD
  // Check authentication: use localStorage state (like navbar) as primary check
  // If localStorage says logged in but API call failed, still allow access
  // Only show "must log in" if both localStorage and API say not authenticated
  const isAuthenticated = user || localAuthState.isLoggedIn || localAuthState.hasToken;

  if (!isAuthenticated && !authLoading) {
    // Only show error if truly not authenticated (no localStorage flag and no token)
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <ErrorState
            message={locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first'}
            fullScreen={false}
          />
          <div className="mt-6 text-center">
            <Link href={`/${locale}/login`}>
              <Button variant="primary" className="px-6 py-2">
                {locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Login'}
              </Button>
            </Link>
          </div>
=======
  // If user is already a maker, show redirecting message
  if (user && user.role === 'MAKER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t.alreadyMaker}</h2>
          <p className="text-gray-400">{t.redirecting}</p>
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  const content = {
    ar: {
      title: 'انضم كصانع في Banda Chao',
      subtitle: 'شارك إبداعك مع العالم واربح من منتجاتك',
      whyJoin: 'لماذا تنضم؟',
      reasons: [
        'منصة عادلة تربطك مباشرة بالمشترين',
        'دعم متعدد اللغات (عربي، إنجليزي، صيني)',
        'أدوات ذكية لمساعدتك في النجاح',
        'نموذج ربح واضح وعادل',
      ],
      form: {
        displayName: 'الاسم المعروض',
        bio: 'نبذة عنك',
        country: 'البلد',
        city: 'المدينة',
        languages: 'اللغات',
        categories: 'فئات المنتجات',
        submit: 'إنشاء ملف صانع',
      },
    },
    en: {
      title: 'Join as a Maker on Banda Chao',
      subtitle: 'Share your creativity with the world and earn from your products',
      whyJoin: 'Why Join?',
      reasons: [
        'Fair platform connecting you directly with buyers',
        'Multi-language support (Arabic, English, Chinese)',
        'Smart tools to help you succeed',
        'Clear and fair revenue model',
      ],
      form: {
        displayName: 'Display Name',
        bio: 'Bio',
        country: 'Country',
        city: 'City',
        languages: 'Languages',
        categories: 'Product Categories',
        submit: 'Create Maker Profile',
      },
    },
    zh: {
      title: '加入 Banda Chao 成为手工艺人',
      subtitle: '与世界分享您的创造力，从您的产品中赚钱',
      whyJoin: '为什么加入？',
      reasons: [
        '公平的平台，直接将您与买家联系起来',
        '多语言支持（阿拉伯语、英语、中文）',
        '智能工具帮助您成功',
        '清晰公平的收入模式',
      ],
      form: {
        displayName: '显示名称',
        bio: '简介',
        country: '国家',
        city: '城市',
        languages: '语言',
        categories: '产品类别',
        submit: '创建手工艺人档案',
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Why Join */}
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.whyJoin}</h2>
              <ul className="space-y-4">
                {t.reasons.map((reason, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Form */}
          <Card>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.displayName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t.form.displayName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.bio} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t.form.bio}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.country}
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={t.form.country}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.form.city}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={t.form.city}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.languages}
                  </label>
                  <div className="flex gap-4">
                    {['ar', 'en', 'zh'].map((lang) => (
                      <label key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                languages: [...formData.languages, lang],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                languages: formData.languages.filter((l) => l !== lang),
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {lang === 'ar' ? 'عربي' : lang === 'en' ? 'English' : '中文'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (locale === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : t.form.submit}
                </Button>
              </form>
            </div>
          </Card>
=======
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 mb-6">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-gray-300">{t.subtitle}</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {t.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border-2 border-amber-500/20 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-lg font-semibold text-white">{benefit}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-amber-900/50 to-yellow-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/30 p-8 md:p-12 text-center">
          {upgradeSuccess ? (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-white">{t.success}</h2>
              <p className="text-gray-300">{t.redirecting}</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {user
                  ? locale === 'ar'
                    ? 'جاهز للبدء؟'
                    : locale === 'zh'
                    ? '准备好开始了吗？'
                    : 'Ready to Get Started?'
                  : locale === 'ar'
                  ? 'سجل الدخول أولاً'
                  : locale === 'zh'
                  ? '请先登录'
                  : 'Please Sign In First'}
              </h2>
              <p className="text-gray-300 mb-8">
                {user
                  ? locale === 'ar'
                    ? 'انقر أدناه لترقية حسابك إلى صانع'
                    : locale === 'zh'
                    ? '点击下方将您的账户升级为手工艺人'
                    : 'Click below to upgrade your account to Maker'
                  : locale === 'ar'
                  ? 'يجب أن تكون مسجلاً للانضمام كصانع'
                  : locale === 'zh'
                  ? '您需要登录才能成为手工艺人'
                  : 'You need to be signed in to become a Maker'}
              </p>
              
              {user ? (
                <Button
                  variant="primary"
                  onClick={handleBecomeSeller}
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                >
                  {isUpgrading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      {t.upgrading}
                    </>
                  ) : (
                    <>
                      {t.becomeSeller}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/${locale}/auth/signin`)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                >
                  {locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </>
          )}
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
