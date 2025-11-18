'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Assistant {
  id: string;
  label: string;
  route: string;
  emoji: string;
  gradient: string;
}

const assistants: Assistant[] = [
  {
    id: 'founder',
    label: 'الباندا المؤسس',
    route: '/founder/assistant/founder-brain',
    emoji: '🐼',
    gradient: 'bg-gradient-to-l from-rose-600 via-amber-500 to-rose-500',
  },
  {
    id: 'tech',
    label: 'الباندا التقني',
    route: '/founder/assistant/technical-brain',
    emoji: '💻',
    gradient: 'bg-gradient-to-l from-sky-700 via-cyan-600 to-sky-500',
  },
  {
    id: 'guard',
    label: 'الباندا الحارس',
    route: '/founder/assistant/security-brain',
    emoji: '🛡️',
    gradient: 'bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500',
  },
  {
    id: 'commerce',
    label: 'باندا التجارة',
    route: '/founder/assistant/marketing-brain',
    emoji: '📊',
    gradient: 'bg-gradient-to-l from-orange-600 via-amber-500 to-yellow-500',
  },
  {
    id: 'content',
    label: 'باندا المحتوى',
    route: '/founder/assistant/content-brain',
    emoji: '✍️',
    gradient: 'bg-gradient-to-l from-fuchsia-600 via-purple-500 to-violet-500',
  },
  {
    id: 'logistics',
    label: 'باندا اللوجستيات',
    route: '/founder/assistant/logistics-brain',
    emoji: '📦',
    gradient: 'bg-gradient-to-l from-slate-700 via-slate-600 to-slate-500',
  },
];

export default function FounderSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      <div className="px-3 py-2 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          AI Assistants
        </h2>
      </div>
      {assistants.map((assistant) => {
        const isActive = pathname === assistant.route || pathname?.startsWith(assistant.route);
        return (
          <Link
            key={assistant.id}
            href={assistant.route}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-2xl">{assistant.emoji}</span>
            <span className="text-sm">{assistant.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

