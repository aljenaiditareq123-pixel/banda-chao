"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AssistantCard from "@/components/founder/AssistantCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getApiBaseUrl } from "@/lib/api-utils";

interface DashboardStats {
  users: number;
  makers: number;
  products: number;
  videos: number;
  orders?: number;
}

export default function FounderPageClient() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "FOUNDER") {
      router.replace("/");
      return;
    }

    // Fetch dashboard stats
    fetchStats();
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const apiBaseUrl = getApiBaseUrl();

      // Stagger requests to avoid overwhelming backend (Render Free tier rate limiting)
      // Fetch users first, then stagger others with small delays
      const usersRes = await fetch(`${apiBaseUrl}/users?limit=1`).catch(() => ({ ok: false }));
      
      await new Promise(resolve => setTimeout(resolve, 150));
      const makersRes = await fetch(`${apiBaseUrl}/makers?limit=1`).catch(() => ({ ok: false }));
      
      await new Promise(resolve => setTimeout(resolve, 150));
      const productsRes = await fetch(`${apiBaseUrl}/products?limit=1`).catch(() => ({ ok: false }));
      
      await new Promise(resolve => setTimeout(resolve, 150));
      const videosRes = await fetch(`${apiBaseUrl}/videos?limit=1`).catch(() => ({ ok: false }));

      const statsData: DashboardStats = {
        users: 0,
        makers: 0,
        products: 0,
        videos: 0,
      };

      if (usersRes.ok && usersRes instanceof Response) {
        const usersData = await usersRes.json();
        statsData.users = usersData.pagination?.total || usersData.data?.length || 0;
      }

      if (makersRes.ok && makersRes instanceof Response) {
        const makersData = await makersRes.json();
        statsData.makers = makersData.data?.length || 0;
      }

      if (productsRes.ok && productsRes instanceof Response) {
        const productsData = await productsRes.json();
        statsData.products = productsData.data?.length || 0;
      }

      if (videosRes.ok && videosRes instanceof Response) {
        const videosData = await videosRes.json();
        statsData.videos = videosData.pagination?.total || videosData.data?.length || 0;
      }

      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading || !user || user.role !== "FOUNDER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const assistants = [
    {
      id: 'founder',
      label: 'الباندا المؤسس',
      description: 'يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية واضحة.',
      emoji: '🐼',
      route: '/founder/assistant/founder-brain',
      gradient: 'bg-gradient-to-l from-rose-600 via-amber-500 to-rose-500',
    },
    {
      id: 'tech',
      label: 'الباندا التقني',
      description: 'يضمن جاهزية البنية التحتية ويقترح حلولاً تقنية قابلة للتوسع.',
      emoji: '💻',
      route: '/founder/assistant/technical-brain',
      gradient: 'bg-gradient-to-l from-sky-700 via-cyan-600 to-sky-500',
    },
    {
      id: 'guard',
      label: 'الباندا الحارس',
      description: 'يراقب الثغرات، يحمي الحسابات، ويصون البيانات المالية الحساسة.',
      emoji: '🛡️',
      route: '/founder/assistant/security-brain',
      gradient: 'bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500',
    },
    {
      id: 'commerce',
      label: 'باندا التجارة',
      description: 'يركّز على نمو الإيرادات وتجربة عميل متكاملة من أول زيارة حتى الدفع.',
      emoji: '📊',
      route: '/founder/assistant/marketing-brain',
      gradient: 'bg-gradient-to-l from-orange-600 via-amber-500 to-yellow-500',
    },
    {
      id: 'content',
      label: 'باندا المحتوى',
      description: 'يبني سرداً جذاباً يحفّز المشاركة ويزيد ولاء المجتمع.',
      emoji: '✍️',
      route: '/founder/assistant/content-brain',
      gradient: 'bg-gradient-to-l from-fuchsia-600 via-purple-500 to-violet-500',
    },
    {
      id: 'logistics',
      label: 'باندا اللوجستيات',
      description: 'يضبط المخزون، التوصيل، وسلاسل الإمداد لضمان تجربة بلا تأخير.',
      emoji: '📦',
      route: '/founder/assistant/logistics-brain',
      gradient: 'bg-gradient-to-l from-slate-700 via-slate-600 to-slate-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="text-6xl" aria-hidden="true">🐼</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('founderCommandCenter') || 'Founder Command Center'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4 leading-relaxed">
            {t('founderHeroDescription') || 'At Banda Chao, you have 6 specialized AI assistants helping you with:'}
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {t('founderAssistantsList') || 'Strategic decisions, technology, security, commerce, content, and logistics'}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalUsers') || 'Total Users'}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.users || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">👥</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalMakers') || 'Total Makers'}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.makers || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">🎨</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalProducts') || 'Total Products'}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.products || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">📦</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalVideos') || 'Total Videos'}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : (stats?.videos || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl" aria-hidden="true">🎬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/founder/assistant"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105"
            aria-label={t('goToAssistantsCenter') || 'Go to Assistants Center'}
          >
            <span aria-hidden="true">🚀</span>
            <span>{t('goToAssistantsCenter') || 'Go to Assistants Center'}</span>
          </Link>
          <Link
            href="/ar/makers"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
            aria-label={t('exploreMakers') || 'Explore Makers'}
          >
            <span aria-hidden="true">👥</span>
            <span>{t('exploreMakers') || 'Explore Makers'}</span>
          </Link>
        </div>
        <p className="text-sm text-gray-500 text-center mb-12">
          {t('founderOnlyAccess') || 'Access restricted to FOUNDER role only'}
        </p>

        {/* Assistants Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            {t('yourSixAssistants') || 'Your Six Assistants'}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('eachAssistantSpecialized') || 'Each assistant specializes in their field and helps you make better decisions'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                id={assistant.id}
                label={assistant.label}
                description={assistant.description}
                emoji={assistant.emoji}
                route={assistant.route}
                gradient={assistant.gradient}
              />
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            {t('quickLinks') || 'Quick Links'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/ar/makers"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              aria-label={t('makersPage') || 'Makers Page'}
            >
              <span className="text-4xl mb-3" aria-hidden="true">👥</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                {t('makersPage') || 'Makers Page'}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('exploreRegisteredMakers') || 'Explore makers registered on the platform'}
              </p>
            </Link>
            <Link
              href="/ar/videos"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              aria-label={t('contentAndVideos') || 'Content and Videos'}
            >
              <span className="text-4xl mb-3" aria-hidden="true">🎬</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                {t('contentAndVideos') || 'Content and Videos'}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('browseVideosAndProducts') || 'Browse videos and products added'}
              </p>
            </Link>
            <Link
              href="/ar/notifications"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
              aria-label={t('notifications') || 'Notifications'}
            >
              <span className="text-4xl mb-3" aria-hidden="true">🔔</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                {t('notifications') || 'Notifications'}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('reviewNotificationsAndControl') || 'Review notifications and control center'}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
