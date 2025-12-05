'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Card from '@/components/common/Card';

interface AIDashboardClientProps {
  locale: string;
}

export default function AIDashboardClient({ locale }: AIDashboardClientProps) {
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login if not authenticated
      window.location.href = `/${locale}/auth/login`;
      return;
    }
  }, [user, authLoading, locale]);

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
        <ErrorState 
          message={locale === 'ar' ? 'يجب تسجيل الدخول للوصول إلى هذه الصفحة' : locale === 'zh' ? '需要登录才能访问此页面' : 'You must be logged in to access this page'} 
          fullScreen 
        />
      </div>
    );
  }

  const texts = {
    ar: {
      title: 'لوحة تحكم AI',
      welcome: 'مرحباً في لوحة تحكم AI',
      description: 'هذه هي لوحة التحكم الخاصة بمساعد AI. يمكنك استخدامها للتفاعل مع المساعد الذكي.',
      comingSoon: 'قريباً: ميزات AI متقدمة',
    },
    en: {
      title: 'AI Dashboard',
      welcome: 'Welcome to AI Dashboard',
      description: 'This is your AI assistant dashboard. You can use it to interact with the intelligent assistant.',
      comingSoon: 'Coming soon: Advanced AI features',
    },
    zh: {
      title: 'AI 仪表板',
      welcome: '欢迎使用 AI 仪表板',
      description: '这是您的 AI 助手仪表板。您可以使用它与智能助手交互。',
      comingSoon: '即将推出：高级 AI 功能',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.welcome}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'المساعد الذكي' : locale === 'zh' ? '智能助手' : 'AI Assistant'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'ar' 
                  ? 'تفاعل مع المساعد الذكي للحصول على المساعدة'
                  : locale === 'zh'
                  ? '与智能助手交互以获得帮助'
                  : 'Interact with the AI assistant for help'}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'اقتراحات ذكية' : locale === 'zh' ? '智能建议' : 'Smart Suggestions'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'ar' 
                  ? 'احصل على اقتراحات مخصصة بناءً على نشاطك'
                  : locale === 'zh'
                  ? '根据您的活动获得个性化建议'
                  : 'Get personalized suggestions based on your activity'}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {locale === 'ar' ? 'تحليلات' : locale === 'zh' ? '分析' : 'Analytics'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'ar' 
                  ? 'راجع إحصائياتك وتحليلاتك'
                  : locale === 'zh'
                  ? '查看您的统计和分析'
                  : 'Review your statistics and analytics'}
              </p>
            </div>
          </Card>
        </div>

        <Card className="mt-6">
          <div className="p-6 text-center">
            <p className="text-gray-500">{t.comingSoon}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

