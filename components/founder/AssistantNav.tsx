'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

const assistants = [
  {
    id: 'founder',
    label: 'Founder Panda',
    labelZh: '创始人熊猫',
    labelAr: 'الباندا المؤسس',
    route: '/founder/assistant/founder-brain',
    emoji: '🐼',
    gradient: 'from-rose-600 to-rose-700',
  },
  {
    id: 'tech',
    label: 'Technical Panda',
    labelZh: '技术熊猫',
    labelAr: 'الباندا التقني',
    route: '/founder/assistant/technical-brain',
    emoji: '💻',
    gradient: 'from-sky-600 to-sky-700',
  },
  {
    id: 'guard',
    label: 'Security Panda',
    labelZh: '安全熊猫',
    labelAr: 'الباندا الحارس',
    route: '/founder/assistant/security-brain',
    emoji: '🛡️',
    gradient: 'from-amber-600 to-amber-700',
  },
  {
    id: 'commerce',
    label: 'Commerce Panda',
    labelZh: '营销熊猫',
    labelAr: 'باندا التجارة',
    route: '/founder/assistant/marketing-brain',
    emoji: '📊',
    gradient: 'from-emerald-600 to-emerald-700',
  },
  {
    id: 'content',
    label: 'Content Panda',
    labelZh: '内容熊猫',
    labelAr: 'الباندا المحتوى',
    route: '/founder/assistant/content-brain',
    emoji: '🎨',
    gradient: 'from-violet-600 to-violet-700',
  },
  {
    id: 'logistics',
    label: 'Logistics Panda',
    labelZh: '物流熊猫',
    labelAr: 'الباندا اللوجستي',
    route: '/founder/assistant/logistics-brain',
    emoji: '🚚',
    gradient: 'from-slate-600 to-slate-700',
  },
  {
    id: 'philosopher',
    label: 'Philosopher Architect Panda',
    labelZh: '哲学家架构熊猫',
    labelAr: 'الباندا الفيلسوف المعماري',
    route: '/founder/assistant/philosopher-brain',
    emoji: '🎓',
    gradient: 'from-indigo-600 to-indigo-700',
  },
];

interface AssistantNavProps {
  currentAssistantId?: string;
  className?: string;
}

export default function AssistantNav({ currentAssistantId, className = '' }: AssistantNavProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const getLabel = (assistant: typeof assistants[0]) => {
    if (language === 'zh') return assistant.labelZh;
    if (language === 'ar') return assistant.labelAr;
    return assistant.label;
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {t('assistants') || 'Assistants'}
        </h3>
        <Link
          href="/founder/assistant"
          className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
        >
          {t('assistantsCenter') || '← Back to Assistants Center'}
        </Link>
      </div>
      <nav className="space-y-2" aria-label="Assistant navigation">
        {assistants.map((assistant) => {
          const isActive = currentAssistantId === assistant.id || pathname === assistant.route;
          return (
            <Link
              key={assistant.id}
              href={assistant.route}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${assistant.gradient} text-white shadow-md`
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label={getLabel(assistant)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl" aria-hidden="true">
                {assistant.emoji}
              </span>
              <span className="text-sm font-medium flex-1">{getLabel(assistant)}</span>
              {isActive && (
                <span className="text-xs opacity-75" aria-hidden="true">
                  ●
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

