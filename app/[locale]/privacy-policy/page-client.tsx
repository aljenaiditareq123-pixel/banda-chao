'use client';

import Card from '@/components/common/Card';

interface PrivacyPolicyClientProps {
  locale: string;
}

export default function PrivacyPolicyClient({ locale }: PrivacyPolicyClientProps) {

  const content = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث:',
      date: 'يناير 2025',
      sections: [
        {
          title: '1. مقدمة',
          content: `نرحب بك في Banda Chao LLC ("نحن"، "لنا"، أو "المنصة"). نحن ملتزمون بحماية خصوصيتك. تشرح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك الشخصية عند استخدام موقعنا الإلكتروني وخدماتنا.`
        },
        {
          title: '2. المعلومات التي نجمعها',
          content: `نجمع المعلومات التالية:
- معلومات الحساب: الاسم، البريد الإلكتروني، كلمة المرور
- معلومات الدفع: تفاصيل بطاقة الائتمان (معالجة آمنة عبر Stripe)
- معلومات الشحن: العنوان، رقم الهاتف
- معلومات الاستخدام: صفحات زارتها، منتجات شاهدتها
- معلومات الأجهزة: نوع المتصفح، عنوان IP`
        },
        {
          title: '3. كيف نستخدم معلوماتك',
          content: `نستخدم معلوماتك لـ:
- معالجة الطلبات والمدفوعات
- تحسين تجربة المستخدم
- إرسال تحديثات الطلبات
- التواصل معك بخصوص حسابك
- تحسين خدماتنا`
        },
        {
          title: '4. مشاركة المعلومات',
          content: `لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك مع:
- شركات الشحن (لتوصيل الطلبات)
- مزودي الدفع (Stripe) - لمعالجة المدفوعات
- مزودي الخدمات التقنية (للمساعدة في تشغيل المنصة)`
        },
        {
          title: '5. حماية البيانات',
          content: `نستخدم تقنيات أمان متقدمة لحماية معلوماتك:
- تشفير SSL/TLS لجميع الاتصالات
- معالجة آمنة للمدفوعات عبر Stripe
- حماية قاعدة البيانات`
        },
        {
          title: '6. حقوقك',
          content: `لديك الحق في:
- الوصول إلى معلوماتك الشخصية
- تصحيح المعلومات غير الصحيحة
- حذف حسابك
- الاعتراض على معالجة بياناتك`
        },
        {
          title: '7. ملفات تعريف الارتباط (Cookies)',
          content: `نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك تعطيلها من إعدادات المتصفح.`
        },
        {
          title: '8. التغييرات على السياسة',
          content: `قد نحدث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات مهمة.`
        },
        {
          title: '9. الاتصال بنا',
          content: `لأي استفسارات حول الخصوصية، راسلنا على:
البريد الإلكتروني: info@bandachao.com
العنوان: Ras Al Khaimah Economic Zone, UAE`
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated:',
      date: 'January 2025',
      sections: [
        {
          title: '1. Introduction',
          content: `Welcome to Banda Chao LLC ("we", "us", or "our platform"). We are committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information when you use our website and services.`
        },
        {
          title: '2. Information We Collect',
          content: `We collect the following information:
- Account Information: Name, email, password
- Payment Information: Credit card details (securely processed via Stripe)
- Shipping Information: Address, phone number
- Usage Information: Pages visited, products viewed
- Device Information: Browser type, IP address`
        },
        {
          title: '3. How We Use Your Information',
          content: `We use your information to:
- Process orders and payments
- Improve user experience
- Send order updates
- Communicate with you about your account
- Improve our services`
        },
        {
          title: '4. Sharing Information',
          content: `We do not sell your personal information. We may share your information with:
- Shipping companies (to deliver orders)
- Payment providers (Stripe) - to process payments
- Technical service providers (to help run the platform)`
        },
        {
          title: '5. Data Protection',
          content: `We use advanced security technologies to protect your information:
- SSL/TLS encryption for all communications
- Secure payment processing via Stripe
- Database protection`
        },
        {
          title: '6. Your Rights',
          content: `You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account
- Object to processing of your data`
        },
        {
          title: '7. Cookies',
          content: `We use cookies to improve your experience. You can disable them from browser settings.`
        },
        {
          title: '8. Policy Changes',
          content: `We may update this policy from time to time. We will notify you of any significant changes.`
        },
        {
          title: '9. Contact Us',
          content: `For any privacy inquiries, contact us at:
Email: info@bandachao.com
Address: Ras Al Khaimah Economic Zone, UAE`
        }
      ]
    },
    zh: {
      title: '隐私政策',
      lastUpdated: '最后更新：',
      date: '2025年1月',
      sections: [
        {
          title: '1. 介绍',
          content: `欢迎使用 Banda Chao LLC（"我们"、"我们的"或"平台"）。我们致力于保护您的隐私。本政策说明我们如何收集、使用和保护您在使用我们网站和服务时的个人信息。`
        },
        {
          title: '2. 我们收集的信息',
          content: `我们收集以下信息：
- 账户信息：姓名、电子邮件、密码
- 支付信息：信用卡详情（通过 Stripe 安全处理）
- 配送信息：地址、电话号码
- 使用信息：访问的页面、查看的产品
- 设备信息：浏览器类型、IP 地址`
        },
        {
          title: '3. 我们如何使用您的信息',
          content: `我们使用您的信息来：
- 处理订单和支付
- 改善用户体验
- 发送订单更新
- 就您的账户与您沟通
- 改善我们的服务`
        },
        {
          title: '4. 信息共享',
          content: `我们不出售您的个人信息。我们可能与以下方共享您的信息：
- 物流公司（用于配送订单）
- 支付提供商（Stripe）- 用于处理支付
- 技术服务提供商（用于帮助运营平台）`
        },
        {
          title: '5. 数据保护',
          content: `我们使用先进的安全技术来保护您的信息：
- 所有通信的 SSL/TLS 加密
- 通过 Stripe 进行安全支付处理
- 数据库保护`
        },
        {
          title: '6. 您的权利',
          content: `您有权：
- 访问您的个人信息
- 更正不准确的信息
- 删除您的账户
- 反对处理您的数据`
        },
        {
          title: '7. Cookie',
          content: `我们使用 Cookie 来改善您的体验。您可以从浏览器设置中禁用它们。`
        },
        {
          title: '8. 政策变更',
          content: `我们可能会不时更新本政策。我们会通知您任何重大变更。`
        },
        {
          title: '9. 联系我们',
          content: `如有任何隐私问题，请通过以下方式联系我们：
电子邮件：info@bandachao.com
地址：Ras Al Khaimah Economic Zone, UAE`
        }
      ]
    }
  };

  const currentContent = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {currentContent.title}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {currentContent.lastUpdated} {currentContent.date}
          </p>

          <div className="space-y-6">
            {currentContent.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

