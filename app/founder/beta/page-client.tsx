'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { betaAPI } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Card from '@/components/common/Card';
import Button from '@/components/Button';

export default function FounderBetaPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Array<{
    id: number;
    name: string;
    email: string;
    country: string;
    main_platform: string | null;
    what_you_sell: string | null;
    preferred_lang: string | null;
    why_join: string | null;
    created_at: Date;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'FOUNDER') {
        window.location.href = '/founder';
        return;
      }
      fetchApplications();
    }
  }, [user, authLoading, filterLanguage, filterCountry]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { language?: string; country?: string } = {};
      if (filterLanguage) params.language = filterLanguage;
      if (filterCountry) params.country = filterCountry;

      const response = await betaAPI.getApplications(params);

      if (response.success && response.applications) {
        setApplications(response.applications as Array<{
          id: number;
          name: string;
          email: string;
          country: string;
          main_platform: string | null;
          what_you_sell: string | null;
          preferred_lang: string | null;
          why_join: string | null;
          created_at: Date;
        }>);
      } else {
        setError(response.error || 'فشل تحميل التطبيقات');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل التطبيقات';
      console.error('Error fetching applications:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingState fullScreen />;
  }

  if (error && applications.length === 0) {
    return <ErrorState message={error} fullScreen />;
  }

  // Get unique languages and countries for filters
  const uniqueLanguages = Array.from(new Set(applications.map(app => app.preferred_lang).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(applications.map(app => app.country).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">طلبات الانضمام إلى Beta</h1>
          <p className="text-gray-600">إجمالي الطلبات: {applications.length}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">تصفية حسب اللغة</label>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">جميع اللغات</option>
                {uniqueLanguages.map(lang => (
                  <option key={lang} value={lang || ''}>
                    {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : lang === 'zh' ? '中文' : lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">تصفية حسب البلد</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">جميع البلدان</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <Button
              variant="text"
              onClick={() => {
                setFilterLanguage('');
                setFilterCountry('');
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </Card>

        {/* Applications List */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <Card>
            <div className="p-8 text-center">
              <p className="text-gray-600">لا توجد طلبات متاحة</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{app.name}</h3>
                      <p className="text-gray-600">{app.email}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">البلد</p>
                      <p className="text-gray-900">{app.country}</p>
                    </div>
                    {app.preferred_lang && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">اللغة المفضلة</p>
                        <p className="text-gray-900">
                          {app.preferred_lang === 'ar' ? 'العربية' : app.preferred_lang === 'en' ? 'English' : app.preferred_lang === 'zh' ? '中文' : app.preferred_lang}
                        </p>
                      </div>
                    )}
                    {app.main_platform && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">المنصة الرئيسية</p>
                        <p className="text-gray-900">{app.main_platform}</p>
                      </div>
                    )}
                    {app.what_you_sell && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">ما يبيعونه</p>
                        <p className="text-gray-900">{app.what_you_sell}</p>
                      </div>
                    )}
                  </div>

                  {app.why_join && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">لماذا يريدون الانضمام؟</p>
                      <p className="text-gray-900">{app.why_join}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

