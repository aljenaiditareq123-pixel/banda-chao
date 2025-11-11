'use client';

import { useTranslations } from 'next-intl';
import { useLanguage } from '@/contexts/LanguageContext';

const RTLPreview: React.FC = () => {
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();

  const handleSwitchToArabic = () => {
    setLanguage('ar');
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('rtlExampleTitle')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('rtlExampleDescription')}</p>
        </div>
        <button
          type="button"
          onClick={handleSwitchToArabic}
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          العربية
        </button>
      </div>
      <div className="mt-6 space-y-3 rounded-lg border border-dashed border-rose-200 bg-rose-50 p-4 text-rose-900">
        <p className="text-base font-medium leading-relaxed">
          مرحباً بك في باندا تشاو! هذا مثال بسيط يؤكد دعم الاتجاه من اليمين إلى اليسار للنص العربي.
        </p>
        <p className="text-sm leading-relaxed">
          يمكنك التبديل إلى لغات أخرى في أي وقت، وستتحول الواجهة تلقائياً إلى الاتجاه المناسب.
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide">
          اللغة الحالية: {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : '中文'}
        </p>
      </div>
    </section>
  );
};

export default RTLPreview;
