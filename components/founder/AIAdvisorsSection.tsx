'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdvisorCard {
  id: string;
  name: string; // Arabic name
  role: string; // Arabic role description
  description: string; // Short description
  status: 'online' | 'thinking' | 'offline';
  icon?: string;
  gradient?: string; // For future use
}

/**
 * AI Advisors Section - Shows 6 AI Pandas as strategic advisors
 * Luxury Gulf Founder Style
 */
export default function AIAdvisorsSection() {
  const advisors: AdvisorCard[] = [
    {
      id: 'founder',
      name: 'الباندا المؤسس',
      role: 'مستشار استراتيجي',
      description: 'يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية',
      status: 'online',
    },
    {
      id: 'tech',
      name: 'الباندا التقني',
      role: 'مستشار تقني',
      description: 'يضمن جاهزية البنية التحتية ويقترح حلولاً قابلة للتوسع',
      status: 'online',
    },
    {
      id: 'guard',
      name: 'الباندا الحارس',
      role: 'مستشار أمني',
      description: 'يراقب الثغرات ويحمي البيانات المالية الحساسة',
      status: 'online',
    },
    {
      id: 'commerce',
      name: 'باندا التجارة',
      role: 'مستشار تجاري',
      description: 'يركّز على نمو الإيرادات وتحسين تجربة العميل',
      status: 'online',
    },
    {
      id: 'content',
      name: 'باندا المحتوى',
      role: 'مستشار محتوى',
      description: 'يبني سرداً جذاباً يحفّز المشاركة ويزيد ولاء المجتمع',
      status: 'online',
    },
    {
      id: 'logistics',
      name: 'باندا اللوجستيات',
      role: 'مستشار لوجستي',
      description: 'يضبط المخزون والتوصيل لضمان تجربة بلا تأخير',
      status: 'online',
    },
  ];

  const getStatusColor = (status: AdvisorCard['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-slate-400';
    }
  };

  const getStatusText = (status: AdvisorCard['status']) => {
    switch (status) {
      case 'online':
        return 'متصل';
      case 'thinking':
        return 'يفكر';
      case 'offline':
        return 'غير متصل';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">مجلس الباندا الاستشاري</h3>
        <p className="text-sm text-slate-500">المستشارون الذكيون لمساعدتك في اتخاذ القرارات الاستراتيجية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {advisors.map((advisor) => (
          <Link
            key={advisor.id}
            href={`/founder/assistant?panda=${advisor.id}`}
            className="group block"
          >
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-400/60 hover:shadow-lg transition-all duration-200 h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-3 rtl:flex-row-reverse">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {advisor.name}
                  </h4>
                  <p className="text-xs text-amber-600 font-medium mb-2">
                    {advisor.role}
                  </p>
                </div>
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    getStatusColor(advisor.status),
                    advisor.status === 'online' && 'animate-pulse'
                  )}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {advisor.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 rtl:flex-row-reverse">
                <span className="text-xs text-slate-500">
                  {getStatusText(advisor.status)}
                </span>
                <span className="text-xs font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
                  بدء جلسة →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          انقر على أي مستشار لبدء جلسة استشارية
        </p>
      </div>
    </div>
  );
}

