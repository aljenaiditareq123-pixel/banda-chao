'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/common/Card';

interface TermsOfServiceClientProps {
  locale: string;
}

export default function TermsOfServiceClient({ locale }: TermsOfServiceClientProps) {
  const content = {
    ar: {
      title: 'شروط الاستخدام',
      lastUpdated: 'آخر تحديث:',
      date: 'يناير 2025',
      sections: [
        {
          title: '1. القبول بالشروط',
          content: `باستخدام موقع Banda Chao، أنت توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام الموقع.`
        },
        {
          title: '2. وصف الخدمة',
          content: `Banda Chao هي منصة تجارة إلكترونية اجتماعية تربط الحرفيين بالمشترين. نحن نقدم:
- منصة لعرض وبيع المنتجات اليدوية
- نظام طلبات ومشتريات
- ميزات التواصل الاجتماعي`
        },
        {
          title: '3. حساب المستخدم',
          content: `أنت مسؤول عن:
- الحفاظ على سرية معلومات حسابك
- جميع الأنشطة التي تحدث تحت حسابك
- إبلاغنا فوراً عن أي استخدام غير مصرح به`
        },
        {
          title: '4. المنتجات والطلبات',
          content: `- نحن لا نضمن جودة المنتجات المباعة من قبل الحرفيين
- الأسعار قابلة للتغيير دون إشعار
- الطلبات قابلة للإلغاء حسب سياسة الإرجاع`
        },
        {
          title: '5. المدفوعات',
          content: `- جميع المدفوعات تتم عبر Stripe بشكل آمن
- الأسعار شاملة ضريبة القيمة المضافة (VAT) 5% في الإمارات
- نحن لسنا مسؤولين عن أي أخطاء في معلومات الدفع التي تقدمها`
        },
        {
          title: '6. الشحن والتوصيل',
          content: `- أوقات الشحن تختلف حسب الموقع
- نحن لسنا مسؤولين عن التأخيرات من شركات الشحن
- المنتجات التالفة أثناء الشحن تخضع لسياسة الإرجاع`
        },
        {
          title: '7. سياسة الإرجاع',
          content: `- يمكن إرجاع المنتجات خلال 14 يوم من الاستلام
- يجب أن تكون المنتجات في حالتها الأصلية
- تكاليف الإرجاع على المشتري (ما لم يكن المنتج معيباً)`
        },
        {
          title: '8. الملكية الفكرية',
          content: `- جميع محتويات الموقع محمية بحقوق الطبع والنشر
- لا يجوز نسخ أو توزيع المحتوى دون إذن
- المنتجات المعروضة مملوكة للحرفيين`
        },
        {
          title: '9. القيود',
          content: `لا يجوز لك:
- استخدام الموقع لأغراض غير قانونية
- محاولة اختراق أو تعطيل الموقع
- نشر محتوى مسيء أو غير قانوني`
        },
        {
          title: '10. إخلاء المسؤولية',
          content: `- الموقع يُقدم "كما هو" دون ضمانات
- نحن لسنا مسؤولين عن أي أضرار ناتجة عن استخدام الموقع
- نحن لسنا مسؤولين عن جودة المنتجات المباعة`
        },
        {
          title: '11. التغييرات على الشروط',
          content: `قد نحدث هذه الشروط من وقت لآخر. استمرار استخدامك للموقع يعني موافقتك على التغييرات.`
        },
        {
          title: '12. القانون الحاكم',
          content: `هذه الشروط تحكمها قوانين دولة الإمارات العربية المتحدة.`
        },
        {
          title: '13. الاتصال بنا',
          content: `لأي استفسارات حول الشروط، راسلنا على:
البريد الإلكتروني: info@bandachao.com
العنوان: Ras Al Khaimah Economic Zone, UAE`
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated:',
      date: 'January 2025',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: `By using Banda Chao website, you agree to be bound by these terms. If you do not agree, please do not use the website.`
        },
        {
          title: '2. Service Description',
          content: `Banda Chao is a social e-commerce platform connecting artisans with buyers. We provide:
- Platform for displaying and selling handmade products
- Order and purchase system
- Social media features`
        },
        {
          title: '3. User Account',
          content: `You are responsible for:
- Maintaining the confidentiality of your account information
- All activities that occur under your account
- Immediately notifying us of any unauthorized use`
        },
        {
          title: '4. Products and Orders',
          content: `- We do not guarantee the quality of products sold by artisans
- Prices are subject to change without notice
- Orders are cancellable according to return policy`
        },
        {
          title: '5. Payments',
          content: `- All payments are processed securely via Stripe
- Prices include 5% VAT in UAE
- We are not responsible for any errors in payment information you provide`
        },
        {
          title: '6. Shipping and Delivery',
          content: `- Shipping times vary by location
- We are not responsible for delays from shipping companies
- Products damaged during shipping are subject to return policy`
        },
        {
          title: '7. Return Policy',
          content: `- Products can be returned within 14 days of receipt
- Products must be in original condition
- Return costs are on the buyer (unless product is defective)`
        },
        {
          title: '8. Intellectual Property',
          content: `- All website content is protected by copyright
- Content may not be copied or distributed without permission
- Displayed products are owned by artisans`
        },
        {
          title: '9. Restrictions',
          content: `You may not:
- Use the website for illegal purposes
- Attempt to hack or disrupt the website
- Post offensive or illegal content`
        },
        {
          title: '10. Disclaimer',
          content: `- The website is provided "as is" without warranties
- We are not liable for any damages resulting from website use
- We are not responsible for the quality of products sold`
        },
        {
          title: '11. Changes to Terms',
          content: `We may update these terms from time to time. Your continued use of the website means you agree to the changes.`
        },
        {
          title: '12. Governing Law',
          content: `These terms are governed by the laws of the United Arab Emirates.`
        },
        {
          title: '13. Contact Us',
          content: `For any inquiries about the terms, contact us at:
Email: info@bandachao.com
Address: Ras Al Khaimah Economic Zone, UAE`
        }
      ]
    },
    zh: {
      title: '服务条款',
      lastUpdated: '最后更新：',
      date: '2025年1月',
      sections: [
        {
          title: '1. 接受条款',
          content: `使用 Banda Chao 网站即表示您同意受这些条款约束。如果您不同意，请不要使用本网站。`
        },
        {
          title: '2. 服务描述',
          content: `Banda Chao 是一个连接手作人和买家的社交电商平台。我们提供：
- 展示和销售手工作品的平台
- 订单和购买系统
- 社交媒体功能`
        },
        {
          title: '3. 用户账户',
          content: `您负责：
- 维护账户信息的机密性
- 您账户下发生的所有活动
- 立即通知我们任何未经授权的使用`
        },
        {
          title: '4. 产品和订单',
          content: `- 我们不保证手作人销售的产品的质量
- 价格可能随时更改，恕不另行通知
- 订单可根据退货政策取消`
        },
        {
          title: '5. 支付',
          content: `- 所有支付均通过 Stripe 安全处理
- 价格包含阿联酋 5% 的增值税
- 我们不负责您提供的支付信息中的任何错误`
        },
        {
          title: '6. 配送和交付',
          content: `- 配送时间因地点而异
- 我们不负责物流公司的延误
- 配送过程中损坏的产品受退货政策约束`
        },
        {
          title: '7. 退货政策',
          content: `- 产品可在收到后 14 天内退货
- 产品必须保持原状
- 退货费用由买家承担（除非产品有缺陷）`
        },
        {
          title: '8. 知识产权',
          content: `- 所有网站内容均受版权保护
- 未经许可不得复制或分发内容
- 展示的产品归手作人所有`
        },
        {
          title: '9. 限制',
          content: `您不得：
- 将网站用于非法目的
- 试图黑客攻击或破坏网站
- 发布冒犯性或非法内容`
        },
        {
          title: '10. 免责声明',
          content: `- 网站按"原样"提供，不提供任何保证
- 我们不承担因使用网站而产生的任何损害
- 我们不负责所售产品的质量`
        },
        {
          title: '11. 条款变更',
          content: `我们可能会不时更新这些条款。您继续使用网站即表示您同意这些变更。`
        },
        {
          title: '12. 适用法律',
          content: `这些条款受阿拉伯联合酋长国法律管辖。`
        },
        {
          title: '13. 联系我们',
          content: `如有任何关于条款的询问，请通过以下方式联系我们：
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

