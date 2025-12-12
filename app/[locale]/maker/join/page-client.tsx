'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import LoadingState from '@/components/common/LoadingState';

interface MakerJoinClientProps {
  locale: string;
}

export default function MakerJoinClient({ locale }: MakerJoinClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
        <LoadingState fullScreen />
      </div>
    );
  }

  // If user is already a maker, show redirecting message
  if (user && user.role === 'MAKER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t.alreadyMaker}</h2>
          <p className="text-gray-400">{t.redirecting}</p>
        </div>
      </div>
    );
  }

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
        </div>
      </div>
    </div>
  );
}
