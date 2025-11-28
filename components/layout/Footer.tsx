'use client';

import Link from 'next/link';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const texts = {
    ar: {
      company: 'Banda Chao LLC',
      description: 'منصة تجارة إلكترونية اجتماعية تربط الحرفيين بالمشترين',
      quickLinks: 'روابط سريعة',
      legal: 'قانوني',
      followUs: 'تابعنا',
      allRightsReserved: 'جميع الحقوق محفوظة',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الاستخدام',
      about: 'عن',
      contact: 'اتصل بنا',
      makers: 'الحرفيون',
      products: 'المنتجات',
      videos: 'الفيديوهات'
    },
    en: {
      company: 'Banda Chao LLC',
      description: 'Social e-commerce platform connecting artisans with buyers',
      quickLinks: 'Quick Links',
      legal: 'Legal',
      followUs: 'Follow Us',
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      about: 'About',
      contact: 'Contact Us',
      makers: 'Makers',
      products: 'Products',
      videos: 'Videos'
    },
    zh: {
      company: 'Banda Chao LLC',
      description: '连接手作人和买家的社交电商平台',
      quickLinks: '快速链接',
      legal: '法律',
      followUs: '关注我们',
      allRightsReserved: '版权所有',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款',
      about: '关于',
      contact: '联系我们',
      makers: '手工艺人',
      products: '产品',
      videos: '视频'
    }
  };

  const currentTexts = texts[locale as keyof typeof texts] || texts.en;

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">{currentTexts.company}</h3>
            <p className="text-gray-400 text-sm mb-4">{currentTexts.description}</p>
            <p className="text-gray-500 text-xs">
              Ras Al Khaimah Economic Zone, UAE
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{currentTexts.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition">
                  {currentTexts.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/makers`} className="hover:text-white transition">
                  {currentTexts.makers}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/products`} className="hover:text-white transition">
                  {currentTexts.products}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/videos`} className="hover:text-white transition">
                  {currentTexts.videos}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">{currentTexts.legal}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/privacy-policy`} className="hover:text-white transition">
                  {currentTexts.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms-of-service`} className="hover:text-white transition">
                  {currentTexts.termsOfService}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>
            © {currentYear} {currentTexts.company}. {currentTexts.allRightsReserved}.
          </p>
        </div>
      </div>
    </footer>
  );
}

