"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AssistantCard from "@/components/founder/AssistantCard";

export default function FounderPageClient() {
  const router = useRouter();
  const { user, loading } = useAuth();

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
  }, [user, loading, router]);

  if (loading || !user || user.role !== "FOUNDER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
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
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl">🐼</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            مركز القيادة للمؤسس
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-4 leading-relaxed">
            في Banda Chao، لديك 6 مساعدين ذكاء اصطناعي متخصصين يساعدونك في:
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            القرارات الاستراتيجية، التقنية، الأمان، التجارة، المحتوى، واللوجستيات
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/founder/assistant"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105"
            >
              <span>🚀</span>
              <span>اذهب إلى مركز المساعدين</span>
            </a>
            <a
              href="/ar/makers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
            >
              <span>👥</span>
              <span>استكشف الحرفيين</span>
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            الوصول مقصور على دور FOUNDER فقط
          </p>
        </div>

        {/* Pandas Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            مساعدوك الستة
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            كل مساعد متخصص في مجاله ويساعدك في اتخاذ قرارات أفضل
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
            روابط سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/ar/makers"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <span className="text-4xl mb-3">👥</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                صفحة الحرفيين
              </h3>
              <p className="text-sm text-gray-600 text-center">
                استكشف الحرفيين المسجلين في المنصة
              </p>
            </a>
            <a
              href="/ar/videos"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <span className="text-4xl mb-3">🎬</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                المحتوى والفيديوهات
              </h3>
              <p className="text-sm text-gray-600 text-center">
                تصفح الفيديوهات والمنتجات المضافة
              </p>
            </a>
            <a
              href="/ar/notifications"
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <span className="text-4xl mb-3">🔔</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                الإشعارات
              </h3>
              <p className="text-sm text-gray-600 text-center">
                راجع الإشعارات ومركز التحكم
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
