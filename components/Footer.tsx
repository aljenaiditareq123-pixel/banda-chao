'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const SUPPORTED_LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
] as const;

type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

const CURRENCIES = ['CNY', 'AED', 'USD'] as const;

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('CNY');

  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#2E7D32] flex items-center justify-center text-2xl">
              🐼
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-wide">Panda Chao</p>
              <p className="text-sm text-gray-300 mt-2 max-w-md leading-relaxed">
                {t('footerTagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
          {/* Column 1 */}
          <div>
            <h3 className="text-lg font-semibold text-[#2E7D32] mb-4">{t('discover')}</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('aboutPandaChao')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('whySell')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('creatorStories')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-lg font-semibold text-[#2E7D32] mb-4">{t('communityServices')}</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('servicesMarketplace')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('becomeServiceProvider')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-lg font-semibold text-[#2E7D32] mb-4">{t('toolsLanguages')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  {t('languageSwitcher')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code)}
                      className={`px-3 py-1 rounded-full border transition text-sm ${
                        language === code
                          ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                          : 'border-gray-500 text-gray-200 hover:border-[#2E7D32] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  {t('currencySwitcher')}
                </p>
                <div className="relative w-40">
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
                    className="w-full appearance-none bg-white text-[#111111] text-sm py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    aria-label={t('currencySwitcher')}
                  >
                    {CURRENCIES.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#111111] text-xs">
                    ▼
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                  {t('appComingSoon')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="h-12 w-36 border border-dashed border-gray-500 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    App Store
                  </div>
                  <div className="h-12 w-36 border border-dashed border-gray-500 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link href="#" className="hover:text-white transition">
              {t('terms')}
            </Link>
            <span className="hidden sm:block text-gray-600">•</span>
            <Link href="#" className="hover:text-white transition">
              {t('privacy')}
            </Link>
          </div>
          <p className="text-xs md:text-sm text-gray-500 md:text-right">
            {t('rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
