'use client';

import { useState } from 'react';
import { betaAPI } from '@/lib/api';
import Button from '@/components/Button';
import Card from '@/components/common/Card';

interface BetaLandingPageClientProps {
  locale: string;
}

const texts = {
  ar: {
    heroTitle: 'Banda Chao Beta - أول 50 حرفي',
    heroSubtitle: 'منصة سوشيال-كومرس للحرفيين المستقلين',
    heroDescription: 'ركزنا على الصين والعالم العربي والحرفيين المبدعين حول العالم. وصول مبكر محدود لأول 50 حرفي.',
    whoIsThisFor: 'لمن هذه المنصة؟',
    whoIsThisForList: [
      'العلامات التجارية الصغيرة',
      'الحرفيين والمبدعين',
      'صانعي المحتوى',
      'المنتجين المستقلين',
    ],
    whatYouGet: 'ماذا ستحصل عليه في Beta؟',
    whatYouGetList: [
      'وصول مبكر مجاني',
      'دعم مباشر من المؤسس/مساعد AI',
      'فرصة للتأثير على خارطة طريق المنتج',
      'أدوات: منتجات، فيديوهات، منشورات، مساعدين AI',
    ],
    howItWorks: 'كيف يعمل؟',
    step1: 'الخطوة 1: قدم ببياناتك',
    step2: 'الخطوة 2: مراجعة من المؤسس',
    step3: 'الخطوة 3: مكالمة تعريفية / إرشادات',
    step4: 'الخطوة 4: ابدأ البيع والمشاركة',
    applyButton: 'قدم للانضمام إلى Beta',
    formTitle: 'نموذج التقديم للانضمام إلى Beta',
    nameLabel: 'الاسم / اسم العلامة التجارية',
    namePlaceholder: 'أدخل اسمك أو اسم علامتك التجارية',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'example@email.com',
    countryLabel: 'البلد',
    countryPlaceholder: 'اختر بلدك',
    platformLabel: 'منصتك الرئيسية اليوم',
    platformPlaceholder: 'TikTok, Instagram, Xiaohongshu, Taobao, إلخ',
    whatYouSellLabel: 'ماذا تبيع؟',
    whatYouSellPlaceholder: 'وصف قصير للمنتجات أو الخدمات',
    preferredLangLabel: 'اللغة المفضلة',
    preferredLangPlaceholder: 'اختر اللغة',
    whyJoinLabel: 'لماذا تريد الانضمام إلى Banda Chao Beta؟',
    whyJoinPlaceholder: 'أخبرنا عن دوافعك وأهدافك',
    submitButton: 'إرسال الطلب',
    submitting: 'جاري الإرسال...',
    success: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
    error: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
  },
  en: {
    heroTitle: 'Banda Chao Beta - First 50 Makers',
    heroSubtitle: 'Social-commerce platform for independent makers',
    heroDescription: 'Focus on China + Arab world + global creatives. Limited early access for the first 50 makers.',
    whoIsThisFor: 'Who is this for?',
    whoIsThisForList: [
      'Small brands',
      'Artisans and creators',
      'Content creators',
      'Independent producers',
    ],
    whatYouGet: 'What do you get in the Beta?',
    whatYouGetList: [
      'Free early access',
      'Direct support from founder/AI assistant',
      'Chance to influence product roadmap',
      'Tools: products, videos, posts, AI helpers',
    ],
    howItWorks: 'How it works',
    step1: 'Step 1: Apply with your details',
    step2: 'Step 2: Review by founder',
    step3: 'Step 3: Onboarding call / guidance',
    step4: 'Step 4: Start selling & sharing',
    applyButton: 'Apply for Beta Access',
    formTitle: 'Early Access Application Form',
    nameLabel: 'Name / Brand name',
    namePlaceholder: 'Enter your name or brand name',
    emailLabel: 'Email',
    emailPlaceholder: 'example@email.com',
    countryLabel: 'Country',
    countryPlaceholder: 'Select your country',
    platformLabel: 'Main platform today',
    platformPlaceholder: 'TikTok, Instagram, Xiaohongshu, Taobao, etc.',
    whatYouSellLabel: 'What do you sell?',
    whatYouSellPlaceholder: 'Short description of products or services',
    preferredLangLabel: 'Preferred language',
    preferredLangPlaceholder: 'Select language',
    whyJoinLabel: 'Why do you want to join Banda Chao Beta?',
    whyJoinPlaceholder: 'Tell us about your motivations and goals',
    submitButton: 'Submit Application',
    submitting: 'Submitting...',
    success: 'Your application has been submitted successfully! We will contact you soon.',
    error: 'An error occurred while submitting your application. Please try again.',
  },
  zh: {
    heroTitle: 'Banda Chao Beta - 前50名制造商',
    heroSubtitle: '独立制造商的社会商务平台',
    heroDescription: '专注于中国+阿拉伯世界+全球创意者。前50名制造商的有限早期访问。',
    whoIsThisFor: '这是给谁的？',
    whoIsThisForList: [
      '小品牌',
      '工匠和创作者',
      '内容创作者',
      '独立制作人',
    ],
    whatYouGet: '在Beta中您会得到什么？',
    whatYouGetList: [
      '免费早期访问',
      '创始人/AI助手的直接支持',
      '影响产品路线图的机会',
      '工具：产品、视频、帖子、AI助手',
    ],
    howItWorks: '它是如何工作的',
    step1: '步骤1：提交您的详细信息',
    step2: '步骤2：创始人审查',
    step3: '步骤3：入职电话/指导',
    step4: '步骤4：开始销售和分享',
    applyButton: '申请Beta访问',
    formTitle: '早期访问申请表',
    nameLabel: '姓名/品牌名称',
    namePlaceholder: '输入您的姓名或品牌名称',
    emailLabel: '电子邮件',
    emailPlaceholder: 'example@email.com',
    countryLabel: '国家',
    countryPlaceholder: '选择您的国家',
    platformLabel: '今天的主要平台',
    platformPlaceholder: 'TikTok, Instagram, 小红书, 淘宝等',
    whatYouSellLabel: '您卖什么？',
    whatYouSellPlaceholder: '产品或服务的简短描述',
    preferredLangLabel: '首选语言',
    preferredLangPlaceholder: '选择语言',
    whyJoinLabel: '您为什么想加入Banda Chao Beta？',
    whyJoinPlaceholder: '告诉我们您的动机和目标',
    submitButton: '提交申请',
    submitting: '提交中...',
    success: '您的申请已成功提交！我们会尽快与您联系。',
    error: '提交申请时出错。请重试。',
  },
};

export default function BetaLandingPageClient({ locale }: BetaLandingPageClientProps) {
  const t = texts[locale as keyof typeof texts] || texts.en;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    mainPlatform: '',
    whatYouSell: '',
    preferredLang: locale,
    whyJoin: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setErrorMessage('');

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.country.trim()) {
      setStatus('error');
      setErrorMessage(t.error);
      setSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus('error');
      setErrorMessage(t.error);
      setSubmitting(false);
      return;
    }

    try {
      const response = await betaAPI.submitApplication(formData);

      if (response.success) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          country: '',
          mainPlatform: '',
          whatYouSell: '',
          preferredLang: locale,
          whyJoin: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(response.error || t.error);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setStatus('error');
      setErrorMessage(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-6">{t.heroSubtitle}</p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t.heroDescription}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Who is this for */}
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.whoIsThisFor}</h2>
              <ul className="space-y-2">
                {t.whoIsThisForList.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* What you get */}
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.whatYouGet}</h2>
              <ul className="space-y-2">
                {t.whatYouGetList.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* How it works */}
        <Card className="mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.howItWorks}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-3">
                  1
                </div>
                <p className="text-gray-700">{t.step1}</p>
              </div>
              <div>
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-3">
                  2
                </div>
                <p className="text-gray-700">{t.step2}</p>
              </div>
              <div>
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-3">
                  3
                </div>
                <p className="text-gray-700">{t.step3}</p>
              </div>
              <div>
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-3">
                  4
                </div>
                <p className="text-gray-700">{t.step4}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Application Form */}
        <Card>
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.formTitle}</h2>
            
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{t.success}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{errorMessage || t.error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.nameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.emailLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.countryLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder={t.countryPlaceholder}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.platformLabel}
                </label>
                <input
                  type="text"
                  value={formData.mainPlatform}
                  onChange={(e) => setFormData({ ...formData, mainPlatform: e.target.value })}
                  placeholder={t.platformPlaceholder}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.whatYouSellLabel}
                </label>
                <input
                  type="text"
                  value={formData.whatYouSell}
                  onChange={(e) => setFormData({ ...formData, whatYouSell: e.target.value })}
                  placeholder={t.whatYouSellPlaceholder}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.preferredLangLabel}
                </label>
                <select
                  value={formData.preferredLang}
                  onChange={(e) => setFormData({ ...formData, preferredLang: e.target.value })}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.whyJoinLabel}
                </label>
                <textarea
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                  placeholder={t.whyJoinPlaceholder}
                  rows={4}
                  disabled={submitting}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? t.submitting : t.submitButton}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

