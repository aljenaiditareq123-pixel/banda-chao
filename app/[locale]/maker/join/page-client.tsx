'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { makersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface MakerJoinClientProps {
  locale: string;
}

export default function MakerJoinClient({ locale }: MakerJoinClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError(locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
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
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <ErrorState
            message={locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first'}
            fullScreen={false}
          />
        </div>
      </div>
    );
  }

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
        </div>
      </div>
    </div>
  );
}

